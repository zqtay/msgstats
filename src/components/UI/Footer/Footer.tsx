import styles from './Footer.module.scss';
import Container from "../Container/Container";

const CR_NAME = "Zong Qing Tay";
const CR_YEAR = "2023";
const GITHUB = "https://github.com/zqtay/msgstats";
const EMAIL = "zqtay96@gmail.com";

const Footer = () => {
  return (
    <footer>
      <Container className={styles.container}>
        <div className={styles.links}>
          <a href={GITHUB}>Github</a>
          <span>|</span>
          <a href={`mailto:${EMAIL}`}>Email</a>
        </div>
        <div>{`Copyright © ${CR_NAME} ${CR_YEAR}`}</div>
      </Container>
    </footer>
  );
};

export default Footer;