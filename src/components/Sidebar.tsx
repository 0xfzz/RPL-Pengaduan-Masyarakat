import React from "react";
import styles from "./Sidebar.module.css"; // Assuming you use CSS Modules for styling

const Sidebar: React.FC = () => {
  return (
    <div className={styles.leftSide}>
    <div className={styles.brandText}>
      <h1>Selamat Datang</h1>
      <p>Layanan Pengaduan untuk Kemudahan Anda</p>
    </div>
  </div>
  );
};

export default Sidebar;