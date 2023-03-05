import styles from "./Nav.module.scss";

const navItems = [
  {text: "Home", link: `/`},
  {text: "Report", link: `/#report`}
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