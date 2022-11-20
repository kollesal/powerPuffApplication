
import Home from "./pages/Home.svelte";
import Users from "./pages/Users.svelte";
import Products from "./pages/Products.svelte";
import Utilities from "./pages/Utilities.svelte";

export default {
    '/': Home,
    '/home': Home,
    '/products': Products,

    '/users': Users,
    '/utilities': Utilities,
}