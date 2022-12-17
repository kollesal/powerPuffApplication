<script>
    import axios from "axios";
  import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

</script>

<div class="container">

    <div class="view" src="images/homep.webp" style="background-repeat: no-repeat; background-size: cover; background-position: center center;">
        <!-- Mask & flexbox options-->
        <div class="mask rgba-black-light align-items-center">
          <!-- Content -->
          <div class="container">
            <!--Grid row-->
            <div class="row">
              <!--Grid column-->
              <div class="col-md-12 mb-4 white-text text-center">
                <h1 class="h1-reponsive white-text text-uppercase font-weight-bold mb-0 pt-md-5 pt-5 wow fadeInDown" data-wow-delay="0.3s"><strong>Power Puff</strong></h1>
                <hr class="hr-light my-4 wow fadeInDown" data-wow-delay="0.4s">
                <h5 class="text mb-4 white-text wow fadeInDown" data-wow-delay="0.4s"><strong>Welcome to the Power Puff Application!</strong></h5>
                <a href="#/products" class="my-button">Search for Products</a>

                {#if $user.user_roles && $user.user_roles.length > 0}
    {#if !$user.user_roles.includes("buyer")}
        <a
            class="my-button"
            href="#/create-product"
            role="button"
            aria-pressed="true">Add a Product</a
        >
    {/if}
{/if}
              </div>
              <!--Grid column-->
            </div>
            <!--Grid row-->
          </div>
          <!-- Content -->
        </div>
        <!-- Mask & flexbox options-->
      </div>
      <!-- Full Page Intro -->
  
    <!-- Main navigation -->
    <!--Main Layout-->
    <main>
      <div class="container">
        <!--Grid row-->
        <div class="row py-5">
          <!--Grid column-->
          <div class="col-md-12 text-center" style="background-color: white; ">
            <p>Hi!</p>
            <p>This Application is created for People, whom like to create and upcycle their clothes.</p>
            <p>If you just want to look at the existing Products, you can do so by clicking on either the Button "Search for Products" or click on "Products" in the Navigation Bar.</p>
            <p>If you'd like to post products yourself, you can register and apply for a Supplier Account!</p>
            <p>For additional Information it is also possible to create a Buyer account, procedure is the same: Register yourself!</p>
            <p></p>
         
          <div class="mx-auto">
        <img
                        src="images/homep.webp"
                        class="rounded-circle"
                        alt="PowerPuff"
                        width="500" 
                    />
        </div>

          </div>
          <!--Grid column-->
        </div>
        <!--Grid row-->
      </div>
    </main>
    <!--Main Layout-->

   
</div>
