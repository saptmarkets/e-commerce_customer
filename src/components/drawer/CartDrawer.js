import React, { useContext } from "react";
import Drawer from "rc-drawer";

//internal import
import Cart from "@components/cart/Cart";
import { SidebarContext } from "@context/SidebarContext";

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useContext(SidebarContext);

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      parent={null}
      level={null}
      placement={"right"}
    >
      <Cart />
    </Drawer>
  );
};
export default CartDrawer;
