// models/supabaseModel.js
import supabase from "@supabase/supabase-js";
import { config} from "dotenv";
import { config as dotConfig } from "dotenv";
import fs from "fs";  
import PDFDocument from "pdfkit";
import xlsx from "xlsx";

dotConfig();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

config();

function jsonToPdf(jsonData, outputPdfPath) {
  // Create the directory if it doesn't exist
  // const directory = outputPdfPath.substring(0, outputPdfPath.lastIndexOf('/'));
  // if (!fs.existsSync(directory)) {
  //   fs.mkdirSync(directory, { recursive: true });
  // }

  const pdfPath = outputPdfPath;
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfPath));

  // Set font and size
  doc.font('Courier').fontSize(8);

  // Convert JSON object to a string and split into lines
  const jsonString = JSON.stringify(jsonData, null, 4);
  const lines = jsonString.split('\n');

  // Write each line to the PDF
  lines.forEach((line, index) => {
    doc.text(line, 10, 10 + index * 10);
  });

  doc.end();
  console.log(`PDF saved to ${pdfPath}`);
}

export async function confirmOrder( orderdata) {
  const order = orderdata.order;
  const shipping_address = orderdata.shipping_address;
  try {
    //first deduct quantites of bought items in their respective tables
    for (const item of order.items) {
      //accessories
      if(item.category === "accessories"){
        //get quantity of item
        const { data, error } = await supabaseClient
        .from('accessories')
        .select('*')
        .eq('accessory_id', item.product_id);
        
        console.log(data[0]['quantity'],data[0]['numberoforders']);
        //update quantity of item
        const { data1, error1 } = await supabaseClient
        .from('accessories')
        .update({ quantity: data[0]['quantity'] - item.quantity })
        .eq('accessory_id', item.product_id);

        //increase the total number of orders of the item
        const { data2, error2 } = await supabaseClient
        .from('accessories')
        .update({ numberoforders: data[0]['numberoforders'] + item.quantity })
        .eq('accessory_id', item.product_id);
      }
      //parts
      if(item.category === "parts"){
        //get quantity of item
        const { data, error } = await supabaseClient
        .from('parts')
        .select('*')
        .eq('part_id', item.product_id);
        
        console.log(data[0]['quantity']);
        //update quantity of item
        const { data1, error1 } = await supabaseClient
        .from('parts')
        .update({ quantity: data[0]['quantity'] - item.quantity })
        .eq('part_id', item.product_id);

        //increase the total number of orders of the item
        const { data2, error2 } = await supabaseClient
        .from('parts')
        .update({ numberoforders: data[0]['numberoforders'] + item.quantity })
        .eq('part_id', item.product_id);
      }
    }
    //now we save the order
    const { data, error } = await supabaseClient
      .from('orderhistory')
      .insert([
        { 
          items: order.items,
          sub_total_price: order.sub_total_price,
          shipping_price: order.shipping_price,
          total_price: order.total_price,
          user_id: order.user_id,
          payment_method: order.payment_method,
          firstname: shipping_address.firstname,
          lastname: shipping_address.lastname,
          city: shipping_address.city,
          address: shipping_address.address,
          zip_code: shipping_address.zip_code,
          email: shipping_address.email,
          phone: shipping_address.phone,
        },
      ]);
      
      //saving pdf of order
      const date_time = new Date();
      const formattedDateTime = date_time.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(' ','_');
      const pdfPath = `./Receipt/${shipping_address.firstname}_${formattedDateTime}.pdf`
      jsonToPdf(orderdata,"temp.pdf");
     
  } catch (error) {
    throw error;
  }
  return
}

export async function getallaccessories() { 
try {
    const { data, error } = await supabaseClient
      .from('accessories')
      .select()
      .order('type', { ascending: true });
    
    if (error || data.length === 0) {
      return null;
    }
    if (data.length !== 0) {
      const accessoriesdata = data;
      console.log(accessoriesdata);
      return { accessoriesdata };
    }
  } catch (error) {
    console.error('Error retrieving accessories:', error);
    return { message: 'An error occurred while retrieving accessories.' };
  }
  return
}

export async function addaccessories(accessoriesdata) { 
  try {
      const { data, error } = await supabaseClient
        .from('accessories')
        .insert([
          {
            name: accessoriesdata.name,
            description: accessoriesdata.description,
            category: accessoriesdata.category,
            brand: accessoriesdata.brand,
            price: accessoriesdata.price,
            quantity: accessoriesdata.quantity,
            images: accessoriesdata.images,
            compatibility: accessoriesdata.compatibility,
            type: accessoriesdata.type,
            subcategory: accessoriesdata.subcategory,
            numberoforders: accessoriesdata.numberoforders,
            }
            ]);
            console.log(error);
            return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function deleteaccessories(uuid) { 
  try {
      const { data, error } = await supabaseClient
        .from('accessories')
        .delete()
        .eq('accessory_id', uuid);
      console.log(error);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function updateAccessory(uuid, updatedFields) {
  try {
    const { data, error } = await supabaseClient
      .from('accessories')
      .update(updatedFields)
      .eq('accessory_id', uuid);

    if (error) {
      throw error;
    }

    return true; // Indicate successful update
  } catch (error) {
    console.error('Error updating data:', error);
    return { message: 'An error occurred while updating data.' };
  }
}

export async function getallparts() { 
    try {
        const { data, error } = await supabaseClient
          .from('parts')
          .select()
          .order('category', { ascending: true });
        
        if (error || data.length === 0) {
          return null;
        }
        if (data.length !== 0) {
          const partsdata = data;
          console.log(partsdata);
          return { partsdata };
        }
      } catch (error) {
        console.error('Error retrieving parts:', error);
        return { message: 'An error occurred while retrieving parts.' };
      }
      return
}

export async function addpart(partdata) { 
  try {
      const { data, error } = await supabaseClient
        .from('parts')
        .insert([
          {
            name: partdata.name,
            description: partdata.description,
            category: partdata.category,
            brand: partdata.brand,
            price: partdata.price,
            quantity: partdata.quantity,
            images: partdata.images,
            compatibility: partdata.compatibility,
            type: partdata.type,
            subcategory: partdata.subcategory,
            numberoforders: partdata.numberoforders,
            }
            ]);
            console.log(error);
            return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function deletepart(uuid) { 
  try {
      const { data, error } = await supabaseClient
        .from('parts')
        .delete()
        .eq('part_id', uuid);
      console.log(error);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function updatePart(uuid, updatedFields) {
  try {
    const { data, error } = await supabaseClient
      .from('parts')
      .update(updatedFields)
      .eq('part_id', uuid);

    if (error) {
      throw error;
    }

    return true; // Indicate successful update
  } catch (error) {
    console.error('Error updating data:', error);
    return { message: 'An error occurred while updating data.' };
  }
}

export async function getallcarcareproducts() { 
  try {
      const { data, error } = await supabaseClient
        .from('carcareproducts')
        .select()
        .order('category', { ascending: true });
      
      if (error || data.length === 0) {
        return null;
      }
      if (data.length !== 0) {
        const partsdata = data;
        console.log(partsdata);
        return { partsdata };
      }
    } catch (error) {
      console.error('Error retrieving parts:', error);
      return { message: 'An error occurred while retrieving parts.' };
    }
    return
}

export async function addcarcareproduct(carcareproductdata) { 
  try {
      const { data, error } = await supabaseClient
        .from('carcareproducts')
        .insert([
          {
            type: carcareproductdata.type,
            name: carcareproductdata.name,
            description: carcareproductdata.description,
            category: carcareproductdata.category,
            subcategory: carcareproductdata.subcategory,
            brand: carcareproductdata.brand,
            price: carcareproductdata.price,
            quantity: carcareproductdata.quantity,
            images: carcareproductdata.images,
            compatibility: carcareproductdata.compatibility,
            numberoforders: carcareproductdata.numberoforders,
            }
            ]);
            console.log(error);
            return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function deletecarcareproduct(uuid) { 
  try {
      const { data, error } = await supabaseClient
        .from('carcareproducts')
        .delete()
        .eq('carcareproduct_id', uuid);
      console.log(error);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return { message: 'An error occurred while storing data.' };
    }
}

export async function updateCarCareProduct(uuid, updatedFields) {
  try {
    const { data, error } = await supabaseClient
      .from('carcareproducts')
      .update(updatedFields)
      .eq('carcareproduct_id', uuid);

    if (error) {
      throw error;
    }

    return true; // Indicate successful update
  } catch (error) {
    console.error('Error updating data:', error);
    return { message: 'An error occurred while updating data.' };
  }
}
  
export async function fillSupaBaseCarData(filename) {
  
  // Read the Excel file
  const workbook = xlsx.readFile(filename);

  // Assuming data is in the first sheet, you can modify this accordingly
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert Excel data to JSON
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  // Parse and store data in Supabase table
  jsonData.forEach(async (item) => {
      try {
          const { data, error } = await supabaseClient
          .from('lahore_cars')
          .insert([
              {
                  title: item.title,
                  price: item.price,
                  seller_contact: item.sellercontact,
                  location: item.location,
                  // images: item.images,
                  // model_year: item.modelyear,
                  // mileage: item.millage,
                  // fuel_type: item.fueltype,
                  // transmission: item.transmission,
                  // registered_in: item.registeredin,
                  // color: item.color,
                  // assembly: item.assembly,
                  // engine_capacity: item.enginecapacity,
                  // body_type: item.bodytype,
                  // last_updated: item.lastupdated,
                  // //ad_ref: item.adref,
                  // car_features: item.carfeatures,
                  // seller_comments: item.sellercomments.trim()
              }
          ]);

          if (error) {
              throw error;
          }

          console.log('Data inserted successfully:', data);
      } catch (error) {
          console.error('Error inserting data into Supabase:', error.message);
      }
      return
  });
}

export async function changeOrderHistoryStatus(uuid) {
  try {
    // Fetch the current status
    const { data: existingData, error: fetchError } = await supabaseClient
      .from('orderhistory')
      .select('status')
      .eq('order_id', uuid)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Determine the new status based on the current status
    const newStatus = existingData.status === 'FALSE' ? 'TRUE' : 'FALSE';

    // Update the status
    const { data, error } = await supabaseClient
      .from('orderhistory')
      .update({ status: newStatus })
      .eq('order_id', uuid);

    if (error) {
      throw error;
    }

    return true; // Indicate successful update
  } catch (error) {
    console.error('Error updating data:', error);
    return { message: 'An error occurred while updating data.' };
  }
}  

export async function getallorders() { 
  try {
      const { data, error } = await supabaseClient
        .from('orderhistory')
        .select()
        .order('total_price', { ascending: false });
      
      if (error || data.length === 0) {
        return null;
      }
      if (data.length !== 0) {
        const partsdata = data;
        console.log(partsdata);
        return { partsdata };
      }
    } catch (error) {
      console.error('Error retrieving orderhistory:', error);
      return { message: 'An error occurred while retrieving orderhistory.' };
    }
    return
}