/* package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.aggregator.ArgumentsAccessor;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.ProductCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.types.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.types.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.types.ProductType;

@SpringBootTest
@AutoConfigureMockMvc
public class productControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTA5VDA4OjM1OjUzLjI1MVoiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcwNzQ5NDEzLCJleHAiOjE2NzA3ODU0MTMsInNpZCI6InR5QmFjMFFOSWZBNVJhMGVGbFNocUtNcTVBelZMdXVXIiwibm9uY2UiOiJWelF6TjBGQlFYSjJRemhqTUc4d2FWQkpjR1ZYWlhKeFpVWlliV0U1V0RsdWJVbHFUM2MyWTBZNU1RPT0ifQ.NFiPyXSwOtNnTCi6TAISdyTui4WLdufBSoJEMR9px3EnNqKcGh9eg8cmhm41d3zHUO8oZAk2EzhEB2hs8k8j5G-JX9QG3adorqw__Yd6y7lX47VLvpyUwwBFH4z4TlwyYxWQqI1BRNGtElSTLe8-0mRp_CddM2qmSJPnfP9rwNoJh7hO-OGE7voJPRzn84HD4XeWUJ_8vIjVoQF9vJvEfMm9gOZuS_Z4PzGdK31Q9gr2LrRfgVWt9OD6Y3UCrTNIZy732OB0nmhjsSxWfx6FOkOSz3sNWuE2VFrkM3uaFXzrWSch9qDF-5ii-PY8nw-1HAaPvPkE7ZC_vJ_RWSBRyA";

 @Test
    // Test POST of object
    public void testPostnewProduct() throws Exception {
        ProductCreateDTO u = new ProductCreateDTO(DifficultyType.DIFFICULT, ProductType.SCHNITTMUSTER,ClothingType.PULLOVER,
                 "Long Skirt for Winter", "This is made for winter.", "10", 4.5, "");
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/products/").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(u)))
                .andExpect(status().isCreated());
    } 

  @Test
    // Test GET of list of Products
    // As the Output with the products differ for every request, we only test the Status and not the jasonPath!
    //----------------------------------------------------------------------------------------------------------
    public void testGetAllProducts() throws Exception {
        this.mvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    // Test GET one object
    public void testById() throws Exception {
        mvc.perform(get("/api/products/637a28d70ae17202a2bc8a7a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficultyType", is("MEDIUM")))
                .andExpect(jsonPath("$.productState", is("ACTIVE")))
                .andExpect(jsonPath("$.productType", is("SCHNITTMUSTER")))
                .andExpect(jsonPath("$.clothingType", is("SKIRT")))
                .andExpect(jsonPath("$.productname", is("Double Slit Skirt")))
                .andExpect(jsonPath("$.size", is("0-14")))
                .andExpect(jsonPath("$.price", is(10.6)))
                .andExpect(jsonPath("$.patchart", is("")))
                .andExpect(jsonPath("$.userId", is("6399937ee3713c1942f44783")))
                .andExpect(jsonPath("$.comment", is("")));
    }    
/* 
    @ParameterizedTest
    @CsvSource(value = {
            "min, 35.0",
            "min, 5.0",
    })
    // Test GET pricesabove one object
    public void testGetProductMinPrice(ArgumentsAccessor accessor) throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        int index = 1;
        while (index < accessor.size()) {
            requestParams.add(accessor.getString(index - 1), accessor.getString(index));
            index += 2;
        }

        var response = mvc.perform(get("/api/products/pricesabove")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @ParameterizedTest
    @CsvSource(value = {
            "min, 15.0, max, 25.00",
            "min, 5.0, max, 10.00",
    })
    // Test GET priceinrange one object
    public void testGetProductPriceInRange(ArgumentsAccessor accessor) throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        int index = 1;
        while (index < accessor.size()) {
            requestParams.add(accessor.getString(index - 1), accessor.getString(index));
            index += 2;
        }

        var response = mvc.perform(get("/api/products/priceinrange")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @Test
    // Test GET bystate one object
    public void testGetProductByState() throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        var response = mvc.perform(get("/api/products/bystate")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @Test
    // Test GET byuser one object
    public void testGetProductByUser() throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        var response = mvc.perform(get("/api/products/byuser")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @Test
    // Test GET byproducttype one object
    public void testGetProductByProductType() throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        var response = mvc.perform(get("/api/products/byproducttype")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @ParameterizedTest
    @CsvSource(value = {
            "type, SCHNITTMUSTER",
            "type, MANUAL",
    })
    // Test GET producttype one object
    public void testGetProductProductType(ArgumentsAccessor accessor) throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        int index = 1;
        while (index < accessor.size()) {
            requestParams.add(accessor.getString(index - 1), accessor.getString(index));
            index += 2;
        }

        var response = mvc.perform(get("/api/products/producttype")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @ParameterizedTest
    @CsvSource(value = {
            "state, ACTIVE",
            "state, NEW",
            "state, REVIEW",
            "state, INACTIVE",
    })
    // Test GET productstate one object
    public void testGetProductProductState(ArgumentsAccessor accessor) throws Exception {
        
        LinkedMultiValueMap<String, String> requestParams = new LinkedMultiValueMap<>();

        int index = 1;
        while (index < accessor.size()) {
            requestParams.add(accessor.getString(index - 1), accessor.getString(index));
            index += 2;
        }

        var response = mvc.perform(get("/api/products/productstate")
               // .andExpect(status().isOk())
                .params(requestParams)
                .contentType(MediaType.ALL))
                .andDo(print())
                .andReturn().getResponse();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }


    @Test
    // Test DELETE of object
    public void testDeleteProduct() throws Exception {
        mvc.perform(delete("/api/products/638f4ecd854dfa2710c5a068").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    
    
     @Test
    // As this Statement would delete all my Products, this test is in a BLOCK-COMMENT
    // Test DELETE of object
    public void testDeleteAllProducts() throws Exception {
        mvc.perform(delete("/api/products").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    } 

}  */