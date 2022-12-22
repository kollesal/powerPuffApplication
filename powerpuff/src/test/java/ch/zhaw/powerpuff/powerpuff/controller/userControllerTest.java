/* package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.aggregator.ArgumentsAccessor;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.UserCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UserUpdateDTO;

@SpringBootTest
@AutoConfigureMockMvc
public class userControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIxVDEzOjA4OjQ3LjIxM1oiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNjM1MDc2LCJleHAiOjE2NzE2NzEwNzYsInNpZCI6IkhEcnZUcjFybzFGVjRCUDNKS2pmZDRBbEEyaFI3REpWIiwibm9uY2UiOiJTSGRKZVRKd2RsUlRVVk50VFZsbFEyUlBTak5vWDIxVk0wMVFMa0ZtV1U1Q1YwOXNPRkZHZGxBMll3PT0ifQ.WKNotklKWHyTE_mD6xPjKSU9njUp8-Mn4H8WrwpBzTs0KGYcorf27fJ3L6k6dckevd-m0eAJFRh_EqzG6AQwlMisHxxFQB3vNg80kL5zffCrIYkVOLg-3_zSVKXPA4ieknNBcz9Y_kzEPM-T0gfNoZqOlG6jq-BFyxyERg4eWeEP9ZsQiNFQ9xMpG0kr76ZFQkTRQjY4pWB1o3NWv37OOmEX2ybYEGMZBYl2WSSe7LMOu47EXwtcta5FvdpsSQzg4tK4muUGOsIAG6R3VAxb-JXiFK_vSlnA6DdQAY89zlRYVCXzw6buD6_ZurHvrPE_9x6YAjl_AwyYMoQw5eHJeQ";

     @Test
    // Test POST of object
    public void testPostNewUser() throws Exception {
        UserCreateDTO u = new UserCreateDTO("Test", "testuser", "test@zhaw.ch");
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/users/").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(u)))
                .andExpect(status().isCreated());
    }

    @Test
    // Test POST FORBIDDEN of object
    public void testPostNewUserNotPossible() throws Exception {
       
        mvc.perform(post("/api/users/")
                .contentType("application/json"))
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @CsvSource(value = {
        "name, Salome K, username, salome, email, test@test.ch"
})
// PUT Test of object
    public void testPutUser(ArgumentsAccessor accessor) throws Exception {
       
        UserUpdateDTO userUpdateDTO = new UserUpdateDTO("Salome K", "salome", "Test");

        ObjectMapper mapper = new ObjectMapper();

        mvc.perform(put("/api/users/63a31e3f810e42168979bda7")
        .header(HttpHeaders.AUTHORIZATION,"Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(userUpdateDTO)))
                .andExpect(status().isOk());

    }

    @ParameterizedTest
    @CsvSource(value = {
        "name, Salome K, username, salome, email, test@test.ch"
})
// PUT FORBIDDEN Test of object
    public void testPutUserForbidden(ArgumentsAccessor accessor) throws Exception {
       
        UserUpdateDTO userUpdateDTO = new UserUpdateDTO("Salome K", "salome", "Test");

        ObjectMapper mapper = new ObjectMapper();

        mvc.perform(put("/api/users/639f90ab2cb535157647a591")
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(userUpdateDTO)))
                .andExpect(status().isForbidden());

    }

    @Test
    // Test GET of list of objects
    public void testGetAllUsers() throws Exception {
        this.mvc.perform(get("/api/users").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    @Test
    // UNAUTHORIZED GET of list of objects
    public void testDoNotGetAllUsers() throws Exception {
        this.mvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    // Test GET one object
    public void testById() throws Exception {
        mvc.perform(get("/api/users/6390a5437bb4cf7efe7a59fe").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    @Test
    // Test GET one object
    public void testByMail() throws Exception {
        mvc.perform(get("/api/users/email/kollesal@students.zhaw.ch").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }


    //   @Test
    // // As this Statement would delete all my Users, this test is in a BLOCK-COMMENT
    // // Test DELETE of object
    // public void testDeleteAllUser() throws Exception {
    //     mvc.perform(delete("/api/users").header(HttpHeaders.AUTHORIZATION,
    //             "Bearer " + bearerToken))
    //             .andExpect(status().isOk());
    // }  

    // @Test
    // // Test DELETE of object
    // public void testDeleteUser() throws Exception {
    //     mvc.perform(delete("/api/user/63a3256fcbeb1f5fcaec8b5d").header(HttpHeaders.AUTHORIZATION,
    //             "Bearer " + bearerToken))
    //             .andExpect(status().isOk());
    // }

}
  */