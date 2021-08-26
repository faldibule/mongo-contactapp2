//menggunakan framework express
const express = require('express');
const app = express();
const port = 3000;

// express validator
const {
    body,
    validationResult,
    check
} = require('express-validator');

//methode-override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//mongoose
require('./utils/db');
const Contact = require('./model/contact')

//gunakan EJS
app.set('view engine', 'ejs');
const expressLayout = require('express-ejs-layouts')
app.use(expressLayout);

//flash
const session = require('express-session');
const cookie = require('cookie-parser');
const flash = require('connect-flash')
app.use(cookie('secret'));
app.use(session({
    cookie: {
        maxAge: 6000
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash());

//build-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: true
}));




app.get('/', (req, res) => {
    const mhs = [{
            nama: 'Faldi Nur Ikhsan',
            email: 'faldibule@gmail.com'
        },
        {
            nama: 'Agest Kholifasari',
            email: 'agestks@gmail.com'
        },
        {
            nama: 'Ujang Gaming',
            email: 'ujang@gmail.com'
        },
    ]
    res.render('index', {
        nama: 'Faldi Nur Ikhsan',
        title: 'Home',
        mhs,
        layout: 'layouts/main'
    })
})
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main',
        id: null,
    })
})
app.get('/contact', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.render('contact', {
            title: 'Halaman Contact',
            layout: 'layouts/main',
            contacts,
            msg: req.flash('msg')
        })
    } catch (err) {
        console.log(err);
    }
})
app.post('/contact', [
    body('nama').custom(async (val) => {
        const duplikat = await Contact.findOne({
            nama: val
        });
        if (duplikat) {
            throw new Error('Nama Sudah Terdaftar');
        }
        return true;
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('noTelp', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('contact-form', {
            title: 'Form Contact',
            layout: 'layouts/main',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (err, result) => {
            req.flash('msg', 'Data Sukses Ditambahkan')
            res.redirect('/contact')
        })
    }
})
app.get('/contact/add', (req, res) => {
    res.render('contact-form', {
        title: 'Form Contact',
        layout: 'layouts/main'
    })
})
app.get('/contact/update/:nama', async (req, res) => {
    try {
        const contact = await Contact.findOne({
            nama: req.params.nama
        });
        res.render('edit-form', {
            title: 'Halaman Edit Contact',
            layout: 'layouts/main',
            contact,
        })
    } catch (err) {
        console.log(err);
    }
})

app.put('/contact', [
    body('nama').custom(async (val, {
        req
    }) => {
        const duplikat = await Contact.findOne({
            nama: val
        })
        if (val !== req.body.oldNama && duplikat) {
            throw new Error('Nama Sudah Terdaftar');
        }
        return true;
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('noTelp', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-form', {
            title: 'Form Contact',
            layout: 'layouts/main',
            errors: errors.array(),
            contact: req.body,
        })
    } else {
        Contact.updateOne({
            _id: req.body._id
        }, {
            $set: {
                nama: req.body.nama,
                noTelp: req.body.noTelp,
                email: req.body.email
            }
        }).then((err, result) => {
            req.flash('msg', 'Data Sukses Diubah')
            res.redirect('/contact')
        })

    }
})

app.delete('/contact', (req, res) => {
    Contact.deleteOne({
        nama: req.body.nama
    }).then(result => {
        req.flash('msg', 'Data Sukses Dihapus')
        res.redirect('/contact')
    })
})

app.get('/contact/:nama', async (req, res) => {
    try {
        const nama = req.params.nama;
        const contact = await Contact.findOne({
            nama
        });
        res.render('detail', {
            title: 'Halaman Detail',
            layout: 'layouts/main',
            contact
        })
    } catch (error) {
        console.log(error);
    }
})


app.use((req, res) => {
    res.send('Page Not Found');
})

app.listen(port, () => {
    console.log('Connecting to ' + port);
})