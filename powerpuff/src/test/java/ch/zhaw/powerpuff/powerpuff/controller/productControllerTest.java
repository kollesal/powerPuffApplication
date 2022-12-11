package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.core.Is.is; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete; 
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath; 
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status; 
import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.ProductType;
import ch.zhaw.powerpuff.powerpuff.model.status.ProductCreateDTO; 

@SpringBootTest
@AutoConfigureMockMvc
public class productControllerTest {

    @Autowired private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTA5VDA4OjM1OjUzLjI1MVoiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcwNzQ5NDEzLCJleHAiOjE2NzA3ODU0MTMsInNpZCI6InR5QmFjMFFOSWZBNVJhMGVGbFNocUtNcTVBelZMdXVXIiwibm9uY2UiOiJWelF6TjBGQlFYSjJRemhqTUc4d2FWQkpjR1ZYWlhKeFpVWlliV0U1V0RsdWJVbHFUM2MyWTBZNU1RPT0ifQ.NFiPyXSwOtNnTCi6TAISdyTui4WLdufBSoJEMR9px3EnNqKcGh9eg8cmhm41d3zHUO8oZAk2EzhEB2hs8k8j5G-JX9QG3adorqw__Yd6y7lX47VLvpyUwwBFH4z4TlwyYxWQqI1BRNGtElSTLe8-0mRp_CddM2qmSJPnfP9rwNoJh7hO-OGE7voJPRzn84HD4XeWUJ_8vIjVoQF9vJvEfMm9gOZuS_Z4PzGdK31Q9gr2LrRfgVWt9OD6Y3UCrTNIZy732OB0nmhjsSxWfx6FOkOSz3sNWuE2VFrkM3uaFXzrWSch9qDF-5ii-PY8nw-1HAaPvPkE7ZC_vJ_RWSBRyA";

    @Test
    // Test GET one object
    public void testById() throws Exception {
        mvc.perform(get("/api/products/637a28d70ae17202a2bc8a7a"))
 .andExpect(status().isOk())
 .andExpect(jsonPath("$.difficultyType", is("MEDIUM")))
 .andExpect(jsonPath("$.productState", is("INACTIVE")))
 .andExpect(jsonPath("$.productType", is("SCHNITTMUSTER")))
 .andExpect(jsonPath("$.clothingType", is("DRESS")))
 .andExpect(jsonPath("$.productname", is("Extra Short")))
 .andExpect(jsonPath("$.description", is("test")))
 .andExpect(jsonPath("$.size", is("8")))
 .andExpect(jsonPath("$.price", is(12.6)))
 .andExpect(jsonPath("$.patchart", is("")))
 .andExpect(jsonPath("$.userId", is("6390a5437bb4cf7efe7a59fe")))
 .andExpect(jsonPath("$.comment", is("closing Product")));
    }

@Test
// Test GET of list of Products
public void testGetAllProducts() throws Exception { 
 this.mvc.perform(get("/api/products"))
 .andExpect(status().isOk());
}  

@Test
// Test POST of object
public void testPostnewProduct() throws Exception { 
 ProductCreateDTO u = new ProductCreateDTO(DifficultyType.DIFFICULT, ClothingType.PULLOVER, ProductType.SCHNITTMUSTER, "Long Skirt for Winter", "This is made for winter.", "10","" , 4.5);
 ObjectMapper mapper = new ObjectMapper();
 mvc.perform(post("/api/products/").header(HttpHeaders.AUTHORIZATION,
 "Bearer " + bearerToken) 
 .contentType("application/json") 
 .content(mapper.writeValueAsBytes(u)))
 .andExpect(status().isCreated());
} 

@Test
// Test DELETE of object
public void testDeleteProduct() throws Exception { 
    mvc.perform(delete("/api/products/638f4ecd854dfa2710c5a068").header(HttpHeaders.AUTHORIZATION,
    "Bearer " + bearerToken) )
    .andExpect(status().isOk());
} 

@Test
// Test GETpricesabove one object
public void testGetProductMinPrice() throws Exception {
    Double min = 35.0;

    mvc.perform(get("/api/products/pricesabove")
   /* .param("price", min)*/ )
.andExpect(status().isOk())
.andExpect(jsonPath("$.difficultyType", is("EASY")))
.andExpect(jsonPath("$.productState", is("REVIEW")))
.andExpect(jsonPath("$.productType", is("MANUAL")))
.andExpect(jsonPath("$.clothingType", is("SHIRT")))
.andExpect(jsonPath("$.productname", is("blabla")))
.andExpect(jsonPath("$.description", is("test3")))
.andExpect(jsonPath("$.size", is("10")))
.andExpect(jsonPath("$.price", is(40.0)))
.andExpect(jsonPath("$.patchart", is("")))
.andExpect(jsonPath("$.userId", is("6390a5437bb4cf7efe7a59fe")));
}

    }