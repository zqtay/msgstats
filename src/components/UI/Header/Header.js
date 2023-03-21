import styles from './Header.module.scss';
import Nav from '../Nav/Nav';
import Container from "../Container/Container";

const Header = () => {
  return (
    <header>
      <Container className={styles.container}>
        <a className={styles["nav-brand"]} href={`${process.env.PUBLIC_URL}/`}>
          <img className={styles["brand-logo"]} alt="logo" src={`${process.env.PUBLIC_URL}/logo.png`}></img>
          <span className={styles["brand-text"]}>MsgStats</span>
        </a>
        <div className={styles["nav-container"]}>
          <button className={styles["nav-button"]}>{">"}</button>
          <Nav className={styles["nav-header"]}></Nav>
        </div>
      </Container>
    </header>
  );
};

export default Header;