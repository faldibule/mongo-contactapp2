const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/nodeapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});




// //menambah 1 data
// const contact1 = new Contact({
//     nama: 'Agest Kholifasari',
//     noTelp: '081586648774',
//     email: 'agestks@gmail.com'
// })
// contact1.save().then(res => console.log(res))