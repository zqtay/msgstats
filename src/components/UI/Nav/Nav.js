import styles from "./Nav.module.scss";

const navItems = [
  {text: "Home", link: `${process.env.PUBLIC_URL}/#`},
  {text: "Report", link: `${process.env.PUBLIC_URL}/#report`}
];

const Nav = ({className}) => {
  const fullClassName = (!className || className.length === 0) ?
    styles.nav : `${styles.nav} ${className}`;
  return (
    <nav className={fullClassName}>
      <ul>
        {navItems.map((e, i) => <li key={i}><a href={e.link}>{e.text}</a></li>)}
      </ul>
    </nav>
  );
};

export default Nav;