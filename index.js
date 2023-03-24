const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const { getFirestore, collection, getDoc, setDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore')
const { initializeApp } = require('firebase/app')
require('dotenv/config')

//Configuracion de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAFGcFa47kii2rD0hW_2pmcwi5Fi1OTprg",
    authDomain: "backdicis.firebaseapp.com",
    projectId: "backdicis",
    storageBucket: "backdicis.appspot.com",
    messagingSenderId: "114595176215",
    appId: "1:114595176215:web:09b00e2334b0b69e9d2152"
  }
//Inicializacion de DB en Firebase
const firebase = initializeApp(firebaseConfig)
const db = getFirestore()

//Iniciamos Sevidor
const app = express()

//Opciones de CORS
const corsOptions = {
    "origin": "*",
    "optionSuccessStatus": 200
}

//Configuracion de Servidor
app.use(express.json())
app.use(cors(corsOptions))

//Ruta insertar Registro
app.post('/insertar', (req, res) => {
    const { name, lastname, email, password, number } = req.body

    if(!name || !lastname || !email || !password || !number) {
        res.json({
            'alert': 'Faltan Datos'
        })
        return
    }

    //Validaciones
    if (name.length < 3) {
        res.json({
            'alert': 'El nombre requiere mínimo 3 caractéres'
        })
    } else if (lastname.length < 3) {
        res.json({
            'alert': 'El apellido requiere mínimo 3 caractéres'
        })
    } else if (!email.length) {
        res.json({
            'alert': 'Debes Ingresar un Correo Electronico'
        })
    } else if (password.length < 8) {
        res.json({
            'alert': 'La contraseña debe de tener mínimo 8 caractéres'
        })
    } else if (!Number(number) || !number.length === 10) {
        res.json({
            'alert': 'Ingrese un Numero Valido'
        })
    } else {
        const alumnos = collection(db, "alumnos")
        getDoc(doc(alumnos, email)).then(alumno => {
            if (alumno. exists()) {
                res.json({
                    'alert': 'Este correo ya Existe'
                })
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        sentData = {
                            name,
                            lastname,
                            email,
                            password: hash,
                            number
                        }

                        //Guardar en DB
                        setDoc(doc(alumnos, email), sentData).then(() => {
                            res.json({
                                'alert': 'success'
                            })
                        }).catch((error) => {
                            res.json({
                                'alert': error
                            })
                        })
                    })
                })
            }
        })
    }
})

//Ruta para login
app.post('/login', (req, res) => {
    const { email, password } = req.body

    if ( !email || !password ) {
        res.json({
            'alert': 'Faltan Datos' 
        })
    }

    const alumnos = collection(db, 'alumnos')
    getDoc(doc(alumnos, email)).then( (alumno) => {
        if(!alumno.exists()) {
            res.json({
                'alert': 'Correo No Registrado'
            })
        } else {
            bcrypt.compare(password, alumno.data().password, (error, result) => {
                if( result ) {
                    //Para regresar datos
                    let data = alumno.data()
                    res.json({
                        'alert': 'Success',
                        name: data.name,
                        lastname: data.lastname
                    })
                } else {
                    res.json({
                        'alert': 'Wrong Password',
                    })
                }
            })
        }
    })
})

//Ruta para obtener documentos en DB
app.get('/traertodo', async (req, res) => {
    const alumnos = collection(db, "alumnos")
    const arreglo = await getDocs(alumnos)
    let returnData = []
    arreglo.forEach(alumno => {
        returnData.push(alumno.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//Ruta para eleminar
app.post('/eliminar', (req, res) => {
    const { email } = req.body
    /*let alumnoBorrado = db.collection('alumnos').where('email', '==', email)
    alumnoBorrado.get().then((item) => {
        item.forEach((doc) => {
            doc.ref.delete()
        })
    })
    res.json({
        'alert': 'Classmate Deleted'
    })*/
    console.log('email', email)
    let alumnoBorrado = doc(db, "alumnos", email)
    console.log('alumno', alumnoBorrado, email)
    deleteDoc(alumnoBorrado)
    res.json({
        'alert': 'Classmate Deleted'
    })
})

//Ruta para actualizar
app.post('/actualizar', (req, res) => {
    const { name, email, lastname, number } = req.body
    if (name.length < 3) {
        res.json({
            'alert': 'El nombre requiere mínimo 3 caractéres'
        })
    } else if (lastname.length < 3) {
        res.json({
            'alert': 'El apellido requiere mínimo 3 caractéres'
        })
    } else if (!email) {
        res.json({
            'alert': 'Debes Ingresar un Correo Electronico'
        })
    } else if (!Number(number) || !number.length === 10) {
        res.json({
            'alert': 'Ingrese un Numero Valido'
        })
    } else {
        //Obtener el usuario
        //db.collection('alumnos').doc(email)
        const dataUpdate = {
            name,
            lastname,
            number
        }
        updateDoc(doc(db, "alumnos", email), dataUpdate).then((response) => {
            res.json({
                'alert': "Success"
            })
        }).catch((error) => {
            res.json({
                'alert': error
            })
        })
    }
})

const PORT = process.env.PORT || 12000

app.listen(PORT, () => {
    console.log(`Escuchando puerto: ${PORT}`) 
})