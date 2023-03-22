import Button from "../UI/Button/Button";
import Container from "../UI/Container/Container";
import styles from "./Hero.module.scss";

const Hero = (props: {}) => {
  return (
    <section id="hero" className={styles["hero-section"]}>
      <Container>
        <div className={styles["hero"]}>
          <div className={styles["hero-title"]}>
            MsgStats
          </div>
          <div className={styles["hero-subtitle"]}>
            Transform your message history into meaningful stories.
          </div>
          <Button href={`${process.env.PUBLIC_URL}/#start`}>Start</Button>
        </div>
      </Container>
    </section>
  );
};

export default Hero;