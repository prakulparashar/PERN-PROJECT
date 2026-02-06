import React from "react";
import LogoutButton from "./LogoutButton";
import Nav from "./Nav"
import ProductList from "./ProductList";

const Dashboard = () => {
  const username = localStorage.getItem("username");

  return (
    <div>
    <Nav/>
    <ProductList/>
    </div>
  );
};

export default Dashboard;
