
import {confirmOrder, getallaccessories, getallcarcareproducts, getallparts, fillSupaBaseCarData, addcarcareproduct, addpart, addaccessories, deleteaccessories, deletepart, deletecarcareproduct, updateCarCareProduct, updateAccessory, updatePart, changeOrderHistoryStatus, getallorders} from '../Models/supabaseModel.js';

export async function saveNewOrder(req, res) {
  const orderdetails = req.body;
  try {
        const data = await confirmOrder(orderdetails);
        return res.status(200).json({ message: 'Order saved successfully', data });
  } catch (error) {
    console.error('Error saving history:', error);
    return res.status(500).json({ message: 'An error occurred while saving Order.' });
  }
  return
}

export async function getaccessoriesdata(req, res) {
  try {
        const data = await getallaccessories();
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'Accessories found', data });
  } catch (error) {
    console.error('Error getting Accessories:', error);
    return res.status(500).json({ message: 'An error occurred while getting Accessories.' });
  }
  return
}

export async function addaccessoriesdata(req, res) {
  try {
        const data = await addaccessories(req.body);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data stored'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while storing data.' });
  }
}

export async function deleteaccessoriesdata(req, res) {
  try {
        const data = await deleteaccessories(req.body.accessory_id);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data deleted'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while deleting data.' });
  }
}

export async function updateaccessorydata(req, res) {
  try {
        const data = await updateAccessory(req.body.accessory_id,req.body.updatedfields);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data updated'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while updating data.' });
  }
}

export async function getpartsdata(req, res) {
  try {
        const data = await getallparts();
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'parts found', data });
  } catch (error) {
    console.error('Error getting parts:', error);
    return res.status(500).json({ message: 'An error occurred while getting parts.' });
  }
}

export async function addpartdata(req, res) {
  try {
        const data = await addpart(req.body);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data stored'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while storing data.' });
  }
}

export async function deletepartdata(req, res) {
  try {
        const data = await deletepart(req.body.part_id);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data deleted'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while deleting data.' });
  }
}

export async function updatepartdata(req, res) {
  try {
        const data = await updatePart(req.body.part_id,req.body.updatedfields);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data updated'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while updating data.' });
  }
}

export async function getcarcaredata(req, res) {
  try {
        const data = await getallcarcareproducts();
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'parts found', data });
  } catch (error) {
    console.error('Error getting parts:', error);
    return res.status(500).json({ message: 'An error occurred while getting parts.' });
  }
  return
}

export async function addcarcaredata(req, res) {
  try {
        const data = await addcarcareproduct(req.body);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data stored'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while storing data.' });
  }
}

export async function deletecarcareproductdata(req, res) {
  try {
        const data = await deletecarcareproduct(req.body.carcareproduct_id);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data deleted'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while deleting data.' });
  }
}

export async function updatecarcareproductdata(req, res) {
  try {
        const data = await updateCarCareProduct(req.body.carcareproduct_id,req.body.updatedfields);
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'data updated'});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while updating data.' });
  }
}

export async function fillSupaBase(req, res) {
  try {
    const data = await fillSupaBaseCarData(req.body.filename);
  } catch (error) {
    console.error('Error filling database:', error);
    return res.status(500).json({ message: 'An error occurred while filling the database.' });
  }
  return
}

export async function changeOrderStatus(req, res) {
  try {
    const data = await changeOrderHistoryStatus(req.body.uuid);
    return res.status(200).json({ message: 'status changed'});
  } catch (error) {
  return res.status(500).json({ message: 'An error occurred while changing status.' });
  }
}

export async function getorderdata(req, res) {
  try {
        const data = await getallorders();
        if (data === null) {
          return res.status(404).json();
        } 
        return res.status(200).json({ message: 'orderhistory found', data });
  } catch (error) {
    console.error('Error getting parts:', error);
    return res.status(500).json({ message: 'An error occurred while getting parts.' });
  }
}