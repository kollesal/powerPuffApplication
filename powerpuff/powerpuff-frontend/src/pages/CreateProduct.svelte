<script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

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

    function createProduct() {
        var config = {
            method: "post",
            url: api_root + "/api/products",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + $jwt_token
            },
            data: product,
        };

        axios(config)
            .then(function (response) {
                alert("Product created");
            })
            .catch(function (error) {
                alert("Could not create Product");
                console.log(error);
            });
    }
</script>
{#if $isAuthenticated}
{#if !$user.user_roles.includes("buyer")}
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
                <label class="form-label" for="productType">Product Type</label>
                <select
                    bind:value={product.productType}
                    class="form-select"
                    id="type"
                    type="text"
                >
                    <option value="SCHNITTMUSTER">Schnittmuster</option>
                    <option value="MANUAL">Manual</option>
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
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="DIFFICULT">Difficult</option>
                </select>
            </div>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label class="form-label" for="clothingType"
                    >Clothing Type</label
                >
                <select
                    bind:value={product.clothingType}
                    class="form-select"
                    id="type"
                    type="text"
                >
                    <option value="SHIRT">Shirt</option>
                    <option value="TSHIRT">T-Shirt</option>
                    <option value="PULLOVER">Pullover</option>
                    <option value="BLOUSE">Blouse</option>
                    <option value="JACKET">Jacket</option>
                    <option value="TROUSERS">Trousers</option>
                    <option value="SKIRT">Skirt</option>
                    <option value="DRESS">Dress</option>
                    <option value="SOCKS">Socks</option>
                    <option value="ACCESSOIRES">Accessoires</option>
                    <option selected value="UNDEFINED">Undefined</option>
                </select>
            </div>
            <div class="col">
                <label class="form-label" for="price">Price</label>
                <input
                    bind:value={product.price}
                    class="form-control"
                    id="earnings"
                    type="number"
                />
            </div>

            {#if product.productType !== "MANUAL"}
                <div class="col">
                    <label class="form-label" for="size">Size</label>
                    <input
                        bind:value={product.size}
                        class="form-control"
                        id="description"
                        type="text"
                    />
                </div>
            {:else}
                <div class="col">
                    <label class="form-label" for="size">Patchart</label>
                    <input
                        bind:value={product.patchart}
                        class="form-control"
                        id="description"
                        type="text"
                    />
                </div>
            {/if}
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
    <a class="my-button" href="#/products" on:click={createProduct}>Submit</a>
    <a class="back-button" href="#/products" role="button" aria-pressed="true">Back</a>
{:else}
    <div class="alert" role="alert">
        <h3><b>Not correct Role</b></h3>
    </div>
{/if}

{:else}
  <div class="alert" role="alert">
    <h3><b>Not logged in</b></h3>
  </div>
{/if}
