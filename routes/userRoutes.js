const express = require('express');
const router = express.Router();
const { registerUser, updateUser, getAllUsers, updateAdminStatus, getDonations, updateValenteerStatus } = require('../controllers/userController');
const { updateProductPage, slideFun, getSlides, updateSlide, deleteSlide } = require('../controllers/productPageController');
const { createBlog, getBlogs, updateBlog, deleteBlog, contactMessage } = require('../controllers/blogController');

router.post('/register', registerUser);
router.put('/:id', updateUser);
router.get('/get-all-users', getAllUsers)
router.patch('/update-product/:id',updateProductPage)
router.patch('/isadmin-update', updateAdminStatus)
router.patch('/isvolunteer-update', updateValenteerStatus)


router.post('/create-slide', slideFun);
router.get('/get-slide', getSlides);
router.patch('/update-slide', updateSlide);
router.delete('/delete-slide', deleteSlide);


router.post('/create-blog', createBlog);
router.get('/get-blog', getBlogs);
router.patch('/update-blog/:id', updateBlog);
router.delete('/delete-blog/:id', deleteBlog);
router.post('/contact-message', contactMessage);



router.get('/all-donors', getDonations);




















module.exports = router;
