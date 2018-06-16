import firebase from "firebase";
import {compose, map, prop, toPairs, zipObj, filter, isNil, complement} from 'ramda';

const config = {
  apiKey: "AIzaSyAEGDa0uCULxk0RFhNyUukTkj27ZGGm2Zc",
  authDomain: "babbel-99a5d.firebaseapp.com",
  databaseURL: "https://babbel-99a5d.firebaseio.com",
  storageBucket: "babbel-99a5d.appspot.com",
  projectId: "babbel-99a5d",
  messagingSenderId: "687535823687",
};
const DOCUMENT_ID = 'JbzJgmt8wJW8NwsFX3qZ';

firebase.initializeApp(config);
const settings = {timestampsInSnapshots: true};
const db = firebase.firestore();
db.settings(settings);

export const getAllTranslations = (lang) => {
  return db.collection("translations").doc(DOCUMENT_ID).get().then((doc) => {
    return doc.data()[lang] || [];
  });
};

export const getAllTranslationsBy = (source, target) => {
  return getAllTranslations(source)
    .then(
      compose(
        map(zipObj(['source', 'target'])), // transform to an array of object where 1st element is map to source key and 2nd element is map target key
        toPairs, // transform to an array of array where 1st element is source and 2nd element is target
        filter(complement(isNil)), // remove keys with no values
        map(prop(target)) // create an object where keys are source and values are target
      )
    )
};

export const addTranslations = (sourceLanguage, targetLanguage, sourceValue, targetValue) => {
  return db.collection("translations").doc(DOCUMENT_ID).set({
    [sourceLanguage]: {
      [sourceValue]: {
        [targetLanguage]: targetValue,
      }
    },
    [targetLanguage]: {
      [targetValue]: {
        [sourceLanguage]: sourceValue,
      }
    }
  }, {merge: true})
};

export const deleteTranslations = (sourceLanguage, targetLanguage, sourceValue, targetValue) => {
  return db.collection("translations").doc(DOCUMENT_ID).update({
    [`${sourceLanguage}.${sourceValue}.${targetLanguage}`]: firebase.firestore.FieldValue.delete(),
    [`${targetLanguage}.${targetValue}.${sourceLanguage}`]: firebase.firestore.FieldValue.delete(),
  });
};

const provider = new firebase.auth.GoogleAuthProvider();

export const onAuthStateChanged = (cb) => firebase.auth().onAuthStateChanged(cb);

export const login = () => {
  return firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => firebase.auth().signInWithPopup(provider))
    .catch((error) => {
      // TODO
    });
};

export const logout = () => {
  return firebase
    .auth()
    .signOut();
};