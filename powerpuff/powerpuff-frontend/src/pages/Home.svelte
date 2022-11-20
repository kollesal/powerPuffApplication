<div class="container">
    <div class="mb-5">
        <h1 class="mt-3">Welcome to the Power Puff Application!</h1>
        <div class="col-md-12" />

        <div
            id="carouselExampleIndicators"
            class="carousel slide"
            data-bs-ride="true"
        >
            <div class="carousel-indicators">
                <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="0"
                    class="active"
                    aria-current="true"
                    aria-label="Slide 1"
                />
                <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                />
                <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                />
            </div>
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img src="images/milahome.jpg" class="logo" alt="Mila" />
                </div>
                <div class="carousel-item">
                    <img
                        src="images/mila-superstar.jpg"
                        class="logo"
                        alt="Mila"
                    />
                </div>
                <div class="carousel-item">
                    <img
                        src="images/Mila-Superstar (1).jpg"
                        class="logo"
                        alt="Mila"
                    />
                </div>
            </div>
            <button
                class="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
            >
                <span class="carousel-control-prev-icon" aria-hidden="true" />
                <span class="visually-hidden">Previous</span>
            </button>
            <button
                class="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
            >
                <span class="carousel-control-next-icon" aria-hidden="true" />
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div class="container">
            <div class="col-md-3">
                <a href="#/create-member" class="alert" role="alert">
                    <img
                        class="small-logo"
                        alt="Svelte Logo"
                        src="images/plus.png"
                    />
                    <p>Create a member here!</p>
                </a>
            </div>
            <div class="col-md-3">
                <a href="#/create-team" class="alert" role="alert">
                    <img
                        class="small-logo"
                        alt="Svelte Logo"
                        src="images/plus.png"
                    />
                    <p>Create a team here!</p>
                </a>
            </div>
        </div>
    </div>
</div>
