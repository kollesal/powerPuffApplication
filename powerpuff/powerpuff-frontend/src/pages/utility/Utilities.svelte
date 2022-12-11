<script>
    import axios from "axios";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    let utilities = [];
    let utility = {
        utilityName: null,
        unit: null,
        utilityType: null,
    };

    function getUtilities() {
        var config = {
            method: "get",
            url: api_root + "/api/utilities",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                utilities = response.data;
            })
            .catch(function (error) {
                alert("Could not get utilities");
                console.log(error);
            });
    }

    function createUtility() {
        var config = {
            method: "post",
            url: api_root + "/api/utilities",
            headers: {
                "Content-Type": "application/json",
            },
            data: utility,
        };

        axios(config)
            .then(function (response) {
                alert("Utility created");
                getUtilities();
            })
            .catch(function (error) {
                alert("Could not create Utility");
                console.log(error);
            });
    }

    getUtilities();

</script>

<h1 class="mt-3">Create Utility</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="productname">Username</label>
            <input
                bind:value={utility.utilityname}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
                <label class="form-label" for="earnings">Price</label>
                <input
                    bind:value={utility.unit}
                    class="form-control"
                    id="earnings"
                    type="number"
                />
            </div>

        <div class="col">
            <label class="form-label" for="difficultyType"
                >Utility Type</label
            >
            <select
                bind:value={utility.utilityType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="OTHER">WRITING</option>
                <option value="TEST">MARKING</option>
                <option value="TEST">CUTTING</option>
                <option value="TEST">SEWING</option>
                <option value="TEST">MASCHINE</option>
                <option value="TEST">FOOT</option>
                <option value="TEST">NEEDLE</option>
                <option value="TEST">ATTACHMENT</option>
                <option value="TEST">MEASURING</option>
                <option value="TEST">SECURITY</option>
                <option value="TEST">HELP</option>
                <option value="TEST">THREAD</option>
                <option value="TEST">PATTERN</option>
            </select>
        </div>
    </div>
</form>


<button type="button" class="my-button" on:click={createUtility}
    >Submit</button
>

<div class="row mb-3">
</div>

<h1>All Utilities</h1>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Units</th>
            <th>Utility Types</th>
        </tr>
    </thead>
    <tbody>
        {#each utilities as utility, index}
            <tr
                class="row-tr"
                onclick="document.location = '{'#/utilities/' + utility.id}';"
            >
                <td>
                    {index + 1}
                </td>
                <td>
                    {utility.utilityName}
                </td>
                <td>
                    {utility.unit}
                </td>
                <td>
                    {utility.utilityType}
                </td>
                </tr>
        {/each}
        <tr>
            <dt>
                Number of Products: {utilities.length}
            </dt>
        </tr>
    </tbody>
</table>

