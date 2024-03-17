// routes/chatRoutes.js

import express from "express";
import { getaccessoriesdata, getpartsdata, saveNewOrder, getcarcaredata, fillSupaBase, addcarcaredata, addpartdata, addaccessoriesdata, deleteaccessoriesdata, deletepartdata, deletecarcareproductdata, updatecarcareproductdata, updateaccessorydata, updatepartdata, changeOrderStatus, getorderdata} from "../Services/marketController.js"


const router = express.Router();

router.post('/createorder', saveNewOrder);

router.get('/getaccessories',getaccessoriesdata);

router.post('/addaccessories',addaccessoriesdata);

router.delete('/deleteaccessories',deleteaccessoriesdata);

router.post('/updateaccessories',updateaccessorydata);

router.get('/getparts',getpartsdata);

router.post('/addparts',addpartdata);

router.delete('/deleteparts',deletepartdata);

router.post('/updateparts',updatepartdata);

router.get('/getcarcareproducts',getcarcaredata);

router.post('/addcarcareproducts',addcarcaredata);

router.delete('/deletecarcareproducts',deletecarcareproductdata);

router.post('/updatecarcareproducts',updatecarcareproductdata);

router.post('/savecardata',fillSupaBase)

router.post('/changeorderstatus',changeOrderStatus)

router.get('/getorderhistory',getorderdata);

export default router;