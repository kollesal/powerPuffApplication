<script>
    import axios from "axios";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root =
        "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    let products = [];
    let product = {
        productname: null,
        description: null,
        productType: null,
        difficultyType: null,
        clothingType: null,
        size: null,
        price: null,
        patchart: null,
    };

    function getProducts() {
        var config = {
            method: "get",
            url: api_root + "/api/products",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                products = response.data;
            })
            .catch(function (error) {
                alert("Could not get products");
                console.log(error);
            });
    }
    getProducts();
</script>

<div class="container">
    <div class="mb-5">
        <h1 class="mt-3">Welcome to the Power Puff Application!</h1>
        <div class="col-md-12" />

        <div class="mx-auto">
        <img
                        src="images/homep.webp"
                        class="rounded-circle"
                        alt="PowerPuff"
                        width="500" 
                    />
        </div>

    </div>
</div>
