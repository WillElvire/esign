import { DocumentToSign, SignedDocument } from '@/stores/document'
import { User } from '@/stores/user'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  storageBucket: 'futurafric-sign-e8d24.appspot.com',
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
}
import { Contacts } from './../stores/contact'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export const auth = firebase.auth()
export const firestore = firebase.firestore()
export const storage = firebase.storage()

const provider = new firebase.auth.GoogleAuthProvider()

export const signInWithGoogle = async () => {
  return auth.signInWithPopup(provider)
}

export const usersCollection = firestore.collection('users')
export const documentsCollection = firestore.collection('documentsToSign')
export const contactsCollection = firestore.collection('contacts')

export const getUserDocument = async (uid: string) => {
  if (!uid) return null

  try {
    const userDocument = await usersCollection
      .where('uid', '==', uid)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const matches = querySnapshot.docs.map((d) => d.data())
          return matches[0] // We know there is one doc in the querySnapshot
        } else {
          console.log('No document corresponding to the query!')
          return null
        }
      })
    return { uid, ...userDocument }
  } catch (error) {
    console.error('Error fetching user', error)
  }
}

export const generateUserDocument = async (user: User, additionalData: any = {}) => {
  if (!user) return

  const snapshot = await usersCollection.doc(user.uid).get()

  if (!snapshot.exists) {
    const { email, displayName, photoURL } = user
    try {
      await usersCollection.doc(user.uid).set({
        displayName,
        email,
        photoURL,
        ...additionalData,
      })
    } catch (error) {
      console.error('Error creating user document', error)
    }
  }

  return getUserDocument(user.uid)
}

export const addDocumentToSign = async (
  uid: string,
  email: string,
  docRef: string,
  emails: string[]
) => {
  console.log('Id', uid)

  if (!uid) return

  const signed = false
  const xfdf: any[] = []
  const signedBy: any[] = []
  const requestedTime = new Date()
  const signedTime = ''

  documentsCollection
    .add({
      uid,
      email,
      docRef,
      emails,
      xfdf,
      signedBy,
      signed,
      requestedTime,
      signedTime,
    })
    .then(function (docRef) {
      console.log('Document written with ID: ', docRef.id)
    })
    .catch(function (error) {
      console.error('Error adding document: ', error)
    })
}

export const updateDocumentToSign = async (docId: string, email: string, xfdfSigned: any) => {
  const documentRef = documentsCollection.doc(docId)

  return documentRef
    .get()
    .then(async (doc) => {
      if (!doc.exists) {
        throw new Error('Document not found')
      }

      const { signedBy, emails, xfdf, docRef } = doc.data()

      if (!signedBy.includes(email)) {
        const signedByArray = [...signedBy, email]
        const xfdfArray = [...xfdf, xfdfSigned]
        await documentRef.update({ xfdf: xfdfArray, signedBy: signedByArray })

        if (signedByArray.length === emails.length) {
          const time = new Date()
          await documentRef.update({ signed: true, signedTime: time })

          return { docRef, xfdfArray }
        }
      }
    })
    .catch(function (error) {
      console.log('Error getting document:', error)
    })
}

export const searchForDocumentToSign = async (email?: string): Promise<DocumentToSign[]> => {
  if (!email) {
    email = auth.currentUser?.email
  }

  const query = documentsCollection
    .where('emails', 'array-contains', email)
    .where('signed', '==', false)

  const querySigned = documentsCollection.where('signedBy', 'array-contains', email)

  const docIds: string[] = []
  const docIdSigned: string[] = []

  await querySigned
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const docId = doc.id
        docIdSigned.push(docId)
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { docRef, email, requestedTime } = doc.data()
        const docId = doc.id
        if (!docIdSigned.includes(docId)) {
          docIds.push({ docRef, email, requestedTime, docId })
        }
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  return docIds
}

export const searchForDocumentsSigned = async (email?: string): Promise<SignedDocument[]> => {
  if (!email) {
    email = auth.currentUser?.email
  }

  const docIds: string[] = []

  let query = documentsCollection.where('email', '==', email).where('signed', '==', true)

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { docRef, emails, signedTime } = doc.data()
        const docId = doc.id
        docIds.push({ docRef, emails, signedTime, docId })
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  return docIds
}

export const searchDocumentSent = async (email?: string): Promise<DocumentToSign[]> => {
  if (!email) {
    email = auth.currentUser?.email
  }

  const docIds: string[] = []

  let query = documentsCollection.where('email', '==', email)

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { docRef, emails, signedTime } = doc.data()
        const docId = doc.id
        docIds.push({ docRef, emails, signedTime, docId })
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  return docIds
}

//search contacts

export const searchContacts = async (email?: String): Promise<Contacts[]> => {
  if (!email) {
    email = auth.currentUser?.email
  }

  const contacts: Contacts[] = []

  let query = contactsCollection.where('provider', '==', email)

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const { name, email } = doc.data()
        contacts.push({ name, email })
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  return contacts
}

//search contact

export const searchContact = async (email?: String): Promise<Contacts[]> => {
  const contacts: Contacts[] = []

  let query = contactsCollection.where('email', '==', email)

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (contact) {
        const { name, email } = contact.data()
        contacts.push({ name, email })
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })

  return contacts
}

//deleteContact

export const deleteContact = async (email?: String): Promise<Contacts[]> => {
 
  let query = contactsCollection.where('email', '==', email)

  await query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (contact) {
        contact.ref.delete()
      })
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error)
    })
  
}
