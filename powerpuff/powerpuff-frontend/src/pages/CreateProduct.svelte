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

    function createProduct() {
        var config = {
            method: "post",
            url: api_root + "/api/products",
            headers: {
                "Content-Type": "application/json",
            },
            data: product,
        };

        axios(config)
            .then(function (response) {
                alert("Product created");
                getProducts();
            })
            .catch(function (error) {
                alert("Could not create Product");
                console.log(error);
            });
    }
</script>

<h1 class="mt-3">Create Product</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="productname">Product Name</label>
            <input
                bind:value={product.productname}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
            <label class="form-label" for="difficultyType">Product Type</label>
            <select
                bind:value={product.productType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="OTHER">SCHNITTMUSTER</option>
                <option value="TEST">MANUAL</option>
            </select>
        </div>

        <div class="col">
            <label class="form-label" for="difficultyType"
                >Difficulty Type</label
            >
            <select
                bind:value={product.difficultyType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="OTHER">EASY</option>
                <option value="TEST">MIDDLE</option>
                <option value="TEST">DIFFICULT</option>
            </select>
        </div>
    </div>

    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="type">Clothing Type</label>
            <select
                bind:value={product.clothingType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="OTHER">SHIRT</option>
                <option value="TEST">TSHIRT</option>
                <option value="OTHER">PULLOVER</option>
                <option value="TEST">BLOUSE</option>
                <option value="OTHER">JACKET</option>
                <option value="TEST">TROUSERS</option>
                <option value="OTHER">SKIRT</option>
                <option value="TEST">DRESS</option>
                <option value="TEST">SOCKS</option>
                <option value="OTHER">ACCESSOIRES</option>
                <option selected value="TEST">UNDEFINED</option>
            </select>
        </div>
        <div class="col">
            <label class="form-label" for="earnings">Price</label>
            <input
                bind:value={product.price}
                class="form-control"
                id="earnings"
                type="number"
            />
        </div>

        <div class="col">
            <label class="form-label" for="productname">Size</label>
            <input
                bind:value={product.size}
                class="form-control"
                id="description"
                type="text"
            />
        </div>
    </div>

    <div class="row mb-3">
        <div class="col">
            <label for="description">Description</label>
            <textarea
                bind:value={product.description}
                class="form-control"
                id="description"
                rows="3"
            />
        </div>
    </div>
</form>
<button type="button" class="my-button" on:click={createProduct}
    >Submit</button
>
