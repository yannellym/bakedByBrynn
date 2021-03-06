import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/Add.module.css"


const Add = ( { setClose }) => {

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState(null);
    const [desc, setDesc] = useState(null);
    const [prices, setPrices] = useState([]);
    const [extra, setExtra] = useState(null);
    const [extraOptions, setExtraOptions] = useState([]);
    
    const changePrice = (e, index) => {
      const currentPrices = prices;  //find current prices 
      currentPrices[index] = e.target.value;  // update currentPrices
      setPrices(currentPrices);
    }
    const handleExtraInput = (e) => {
      setExtra({ ...extra, [e.target.name] : e.target.value }); //assings the value to all the  extra inputs
    }
    
    const handleCreate = async () => {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset","uploads") // folder to be created and uploaded to
      try{
        const uploadRes = await axios.post("https://api.cloudinary.com/v1_1/dev1gyf3g/image/upload", data);
        const { url } = uploadRes.data;
        const newProduct = {
          title, 
          desc, 
          prices, 
          extraOptions,
          img: url,
        }
       
      await axios.post("http://localhost:3000/api/products", newProduct);
      setClose(true);
    } catch (err) {
      console.log(err);
    }
  };

    return (
        <div className={styles.container}>
      <div className={styles.wrapper}>
        <span onClick={() => setClose(true)} className={styles.close}>
          X
        </span>
        <h1>Add a new Product</h1>
        <div className={styles.item}>
          <label className={styles.label}>Choose an image</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <div className={styles.item}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.item}>
          <label className={styles.label}>Description</label>
          <textarea
            rows={4}
            type="text"
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className={styles.item}>
          <label className={styles.label}>Price</label>
          <div className={styles.priceContainer}>
            <input
              className={`${styles.input} ${styles.inputSm}`}
              type="number"
              placeholder="$ Dollars"
              onChange={(e) => changePrice(e, 0)}
            />
          </div>
        </div>
        
        <button className={styles.addButton} onClick={handleCreate}>
          Add item
        </button>
      </div>
    </div>
      );
}
 
export default Add;