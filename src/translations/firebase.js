import firebase from "firebase";
import {compose, map, prop, toPairs, zipObj} from 'ramda';

const config = {
  apiKey: "AIzaSyAEGDa0uCULxk0RFhNyUukTkj27ZGGm2Zc",
  authDomain: "babbel-99a5d.firebaseapp.com",
  databaseURL: "https://babbel-99a5d.firebaseio.com",
  storageBucket: "babbel-99a5d.appspot.com",
  projectId: "babbel-99a5d",
  messagingSenderId: "687535823687",
};


firebase.initializeApp(config);

const settings = {timestampsInSnapshots: true};
const db = firebase.firestore();
db.settings(settings);

const documentId = 'JbzJgmt8wJW8NwsFX3qZ';

export const getAllTranslations = (lang) => {
  return db.collection("translations").doc(documentId).get().then((doc) => {
    return doc.data()[lang];
  });
};

export const getAllTranslationsBy = (source, target) => {
  return getAllTranslations(source).then(
    compose(
      map(zipObj(['source', 'target'])),
      toPairs,
      map(prop(target))
    )
  );
};

export const addTranslations = (sourceLanguage, targetLanguage, sourceValue, targetValue) => {
  return db.collection("translations").doc(documentId).set({
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
}