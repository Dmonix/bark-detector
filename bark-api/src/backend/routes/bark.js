const express = require('express');
const multer  = require('multer');
const { createBarkEvent, getBarkEvents, getBarkEventById } = require('../controllers/barkController');

const router = express.Router();

// Multer stores upload temporarily; controller moves it to its final path
const upload = multer({ dest: '/tmp/bark-uploads/' });

router.post('/',    upload.single('audio'), createBarkEvent);
router.get('/',    getBarkEvents);
router.get('/:id', getBarkEventById);

module.exports = router;
