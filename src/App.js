import { Route, Routes } from "react-router";
import "App.scss";
import Home from "components/Home/Home";
import Login from "components/Login/Login";
import Signup from "components/Signup/Signup";
import PrivateRoute from "hoc/PrivateRoute";
import Error from "components/Error/Error";
import PublicDocument from "components/PublicDocument/PublicDocument";
import TemporaryHome from "./components/TemporaryHome";

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<TemporaryHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/documents" element={<PrivateRoute />}>
          <Route path="" element={<Home />} />
          <Route path=":id" element={<Home />} />
        </Route>
        <Route path="/shared/:id" element={<PublicDocument />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}
