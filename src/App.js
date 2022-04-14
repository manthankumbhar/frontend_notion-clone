import { Route, Routes } from "react-router";
import "App.scss";
import Home from "Components/Home/Home";
import Login from "Components/Login/Login";
import Signup from "Components/Signup/Signup";
import PrivateRoute from "hoc/PrivateRoute";
import Error from "Components/Error/Error";

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}
