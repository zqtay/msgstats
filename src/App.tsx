import { Suspense } from "react";
import './App.scss';
import Main from "./components/Main/Main";
import Footer from "./components/UI/Footer/Footer";
import Header from "./components/UI/Header/Header";
import Spinner from "./components/UI/Spinner/Spinner";

function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<Spinner />}>
        <Main />
      </Suspense>

      <Footer />
    </>
  );
}

export default App;
