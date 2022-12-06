
import Home from "./pages/Home.svelte";
import Users from "./pages/Users.svelte";
import Account from "./pages/Account.svelte";
import Utilities from "./pages/Utilities.svelte";

import Products from "./pages/Products.svelte";
import CreateProduct from "./pages/CreateProduct.svelte";
import ProductDetails from "./pages/ProductDetails.svelte"

export default {
    '/': Home,
    '/home': Home,
    '/account': Account,
    '/products': Products,
    '/create-product': CreateProduct,
    '/products/:id': ProductDetails,


    '/users': Users,
    '/utilities': Utilities,
}