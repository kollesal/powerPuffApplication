/* package ch.zhaw.powerpuff.powerpuff.service;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.Optional;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.web.servlet.MockMvc;

import ch.zhaw.powerpuff.powerpuff.model.Product;
import ch.zhaw.powerpuff.powerpuff.model.types.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.types.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.types.ProductType;
import ch.zhaw.powerpuff.powerpuff.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductServiceTests {
    
    @Autowired
    private MockMvc mvc;

    @Autowired
    UserRepository userRepository;


    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIxVDEzOjA4OjQ3LjIxM1oiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNjI4MTI3LCJleHAiOjE2NzE2NjQxMjcsInNpZCI6IkhEcnZUcjFybzFGVjRCUDNKS2pmZDRBbEEyaFI3REpWIiwibm9uY2UiOiJjMVV4ZVhkQ1NVcFRNWEkzT1ZKWFRXSTFkVko1UnpFNU1tSXpaR1EwUW5Cd1RHNUJja0p3YTJGRFlnPT0ifQ.PCien0qYPOLRpQbOgDx1FM8ZeOoq2DkflLfAR5KwjpIJ25oHABELz6zQWzLzeb3D_EujkEUleJiIBSdQtcNNNMnFYe37xu0rjII62jwKj1_iPAzJBkLHSOS6A-yXJVBm6kztNdn1hnV_XZ5LyI82TQxqH6-Q3aPfqz_7B1QERBLxzq4iSsZ9XMHSvXjdpGku6JLzP0yN0kmSqYJVtsEGHBHz8qX9YbGke-E8sYTSebfiVfQ94IaB-ytykhN-LCk0SbqXebEViJVkoGkV565hshGGBWnr_Lg3IfCUqztCpixQzWTpPohpX65W2NBeBPuZny3oCHw4KF9t5p91jndY2Q";


    @Test
    public void testassignProduct() {
    ProductService productService = new ProductService();

    var products = new ArrayList<Product>();
    var user = new ch.zhaw.powerpuff.powerpuff.model.User("kollesal@students.zhaw.ch", "kollesal", "Salome Test");
    products.add(new Product(DifficultyType.EASY, ClothingType.JACKET, ProductType.SCHNITTMUSTER, "productname", "description", "size", "patchart", 0.45));

Optional<Product> = new Product(DifficultyType.EASY, ClothingType.JACKET, ProductType.SCHNITTMUSTER, "productname", "description", "size", "patchart", 0.45);
    // String productId = products.get(0).getId();
    // String userId = user.getId();

     String productId = "63a486c46a9e356a97411655";
     String userId = "6390a5437bb4cf7efe7a59fe";

   assertEquals(products);

    // assertEquals(productService.assignProduct(productId, userId));

    }


    private void assertEquals(Optional<Product> assignProduct) {
    }
}
 */