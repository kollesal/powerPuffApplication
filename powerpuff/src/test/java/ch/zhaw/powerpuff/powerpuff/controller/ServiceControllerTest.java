/* package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.EmailValidationDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.ProductActivateDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.ProductAssignDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.ProductCloseDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.ProductReviewDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UserActivateDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UserChangeUserTypeDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UserCloseDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UtilityAssignDTO;
import ch.zhaw.powerpuff.powerpuff.model.types.UserType;


@SpringBootTest
@AutoConfigureMockMvc
public class ServiceControllerTest {
    
    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIwVDEwOjEyOjQ3LjAyMloiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNTU3NzYzLCJleHAiOjE2NzE1OTM3NjMsInNpZCI6InBkaUlJVVo0UUw1ZVp4a3RvT2xDaVRrU1M1T3J2MEVnIiwibm9uY2UiOiJRMGxXT0hKV2RUbGlNR2xXZEhGS1lXaDBkWFJDTVhOUlZpNVJaRlZ1ZWxrdUxUazJZWEJtWmxSSlNBPT0ifQ.O0WdVxAb1RNXqSWHLJO537DQZRT78GcVRyHJw3uYAQ6ArUMN-h308w8R-3uyFUaXuQtBNbVAfKxLNJwusbRpQqNZtSONeDhjsxyrNzS-XAs_3vTNZBH4-bLPW8hqxDjbR6rSiEEo1d5QKRtHUL5KyhtThB8r5DznxYLFuceuJL7itAeS8x_zq6F6md5wYt0dzYQkD42NL-srLHQ6puEwWKZT7T8aGQMpSc7SR_oQEAu-z09ULs6VnpyjEUKhNbf7754OnbzP6FalYzhuAyZeZPM40OEWOXjj02-mx1jqNyiuiHhmet5puxdSLRmR35fWm0g-UocIo3VkeNno_cA2Eg";

    @Test
    // Test POST Product Assign Product of object
    public void testPostAssignProduct() throws Exception {
        ProductAssignDTO u = new ProductAssignDTO("6399aaebb48aae2b1d6d37ae", "6390a5437bb4cf7efe7a59fe");
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/service/productassignment/").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(u)))
                .andExpect(status().isOk());
    }

    @Test
    // Test FORBIDDEN POST Assign Product of object
    public void testPostAssignProductForbidden() throws Exception {
        ProductAssignDTO u = new ProductAssignDTO("6399aaebb48aae2b1d6d37ae", "6390a5437bb4cf7efe7a59fe");
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/service/productassignment/")
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(u)))
                .andExpect(status().isForbidden());
    }

    @Test
    // Test POST AssignToMe of object
    public void testPostAssignToMe() throws Exception {

        ArrayList<String> assign = new ArrayList<>();
        String productId = "6399aaebb48aae2b1d6d37ae";
        String userEmail = "kollesal@students.zhaw.ch";
        assign.add(productId);
        assign.add(userEmail);
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/service/assigntome/").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(assign)))
                .andExpect(status().isOk());
    }
 
    
 @Test
 // Test POST ProductActivation of object || Status muss INACTIVE / REVIEW SEIN
 public void testPostActivateProduct() throws Exception {
     ProductActivateDTO u = new ProductActivateDTO("6399cceb0fec9749631b3020");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productactivation/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST ProductActivation of object
 public void testPostActivateProductForbidden() throws Exception {
     ProductActivateDTO u = new ProductActivateDTO("6399a8a9b48aae2b1d6d37ab");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productactivation/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST ProductReview of object || Status muss NEW sein
 public void testPostReviewProduct() throws Exception {
     ProductReviewDTO u = new ProductReviewDTO("6399cceb0fec9749631b3020");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productreview/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST ProductReview of object
 public void testPostReviewProductForbidden() throws Exception {
     ProductActivateDTO u = new ProductActivateDTO("6399cceb0fec9749631b3020");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productreview/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST ProductCompletion of object || Status muss ACTIVE sein
 public void testPostCompleteProduct() throws Exception {
     ProductCloseDTO u = new ProductCloseDTO("6399a8a9b48aae2b1d6d37ab", "Test Close Comment");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productcompletion/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST ProductReview of object
 public void testPostCloseProductForbidden() throws Exception {
     ProductCloseDTO u = new ProductCloseDTO("6399a8a9b48aae2b1d6d37ab", "Test Close Comment");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/productcompletion/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST UserActivation of object || Status muss INACTIVE sein
 public void testPostUserActivation() throws Exception {
    UserActivateDTO u = new UserActivateDTO("639f90ab2cb535157647a591");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/useractivation/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST UserActivation of object
 public void testPostUserActivationForbidden() throws Exception {
    UserActivateDTO u = new UserActivateDTO("639f90ab2cb535157647a591");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/useractivation/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST UserCompletion of object || Status muss ACTIVE sein
 public void testPostUserCompletion() throws Exception {
    UserCloseDTO u = new UserCloseDTO("6399937ee3713c1942f44783", "Test Closing User");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/usercompletion/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST UserCompletion of object
 public void testPostUserCompletionForbidden() throws Exception {
    UserCloseDTO u = new UserCloseDTO("6399937ee3713c1942f44783", "Test Closing User");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/usercompletion/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST UserChangeType of object || Status muss ACTIVE sein
 public void testPostUserChangeType() throws Exception {
    UserChangeUserTypeDTO u = new UserChangeUserTypeDTO("639991a436f1b67db81c2a43", UserType.APPLICATION);
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/userchangetype/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST UserChangeType of object
 public void testPostUserChangeTypeForbidden() throws Exception {
    UserChangeUserTypeDTO u = new UserChangeUserTypeDTO("639991a436f1b67db81c2a43", UserType.APPLICATION);
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/userchangetype/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test POST utilityAssignment of object || Status muss ACTIVE sein
 public void testPostUtilityAssignment() throws Exception {
    UtilityAssignDTO u = new UtilityAssignDTO("637a28d70ae17202a2bc8a7a", "6399d8e90eec70756b3b71eb");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/utilityassignment/").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

 @Test
 // Test FORBIDDEN POST utilityAssignment of object
 public void testPostUtilityAssignmentForbidden() throws Exception {
    UtilityAssignDTO u = new UtilityAssignDTO("637a28d70ae17202a2bc8a7a", "6399d8e90eec70756b3b71eb");
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(post("/api/service/utilityassignment/")
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isForbidden());
 }

 @Test
 // Test GET API of object || Status muss ACTIVE sein
 public void testAPI() throws Exception {
    EmailValidationDTO u = new EmailValidationDTO("success", "salome.koller@hr-campus.ch", "hr-campus", true);
     ObjectMapper mapper = new ObjectMapper();
     mvc.perform(get("/api/service/emailvalidation?email=salome.koller@hr-campus.ch").header(HttpHeaders.AUTHORIZATION,
             "Bearer " + bearerToken)
             .contentType("application/json")
             .content(mapper.writeValueAsBytes(u)))
             .andExpect(status().isOk());
 }

@Test
 // Test GET API one object
 public void testGetAPI() throws Exception {
     
     var response = mvc.perform(get("/api/service/emailvalidation?email=salome.koller@hr-campus.ch")
     .contentType(MediaType.ALL))
     .andDo(print())
     .andReturn().getResponse();
 
     assertEquals(HttpStatus.OK.value(), response.getStatus());
 }


}
 */