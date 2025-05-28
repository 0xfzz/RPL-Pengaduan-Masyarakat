import React from "react";
import styles from "./SidebarDashboard.module.css"; // Assuming you use CSS Modules for styling

const SidebarDashboard: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/images/PNG WARNA PUTIH.png" alt="Logo Portal Masyarakat" />
      </div>
      <nav>
        <a href="#">List Pengaduan</a>
      </nav>
    </div>
  );
};

export default SidebarDashboard;