package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.aggregator.ArgumentsAccessor;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.core.Is.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.UserCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.dto.UserUpdateDTO;

@SpringBootTest
@AutoConfigureMockMvc
public class userControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIwVDEwOjEyOjQ3LjAyMloiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNTMxMTY3LCJleHAiOjE2NzE1NjcxNjcsInNpZCI6InBkaUlJVVo0UUw1ZVp4a3RvT2xDaVRrU1M1T3J2MEVnIiwibm9uY2UiOiJaalkyYWt4TVExbE5UeTFvZW1wa2FVWnFWVU5QTm5Sa1ZVcFdVREl6WVVkaFVsRlZmbTVNY2kxT1N3PT0ifQ.JLdFNRi73nvdEac0zfU4BV7lU8h3UNxa62N49YXw-xaDdH1nAdRyHoKWAweferPT0-CUW6kl7xrYaz3kyxrwq97v3cogX_feR_7YanvlSDhJg_lYzKarTLEZT7GwvNVwZPHMzXHwpfA6-85Gmaiyfqp_vLlFCt2JwMOhskuqEs9oXOIxlOHUM9X6XH6mqhbVr1DM0pXIrpNSuFRJxweahKcc8gvfftafVDs2aq_JszCutlj1bhJ2E9j3HiUqZw32asbhnLkqqpcDr951zrJlWwdFW-2zUJvUUoEQKwBgFOGOXAUqlE6mLtwVJA9MjZANDyM17sJdEHazAO4dlpGNGQ";

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

    @Test
    // Test PUT of object
    public void testPutser() throws Exception {
       
        mvc.perform(put("/api/users/639991a436f1b67db81c2a43").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json"))
                .andExpect(status().isOk());
    }

    @ParameterizedTest
    @CsvSource(value = {
        "name, Salome K, username, salome, email, test@test.ch"
})
// PUT Test of object
    public void testPutUser(ArgumentsAccessor accessor) throws Exception {
       
        UserUpdateDTO userUpdateDTO = new UserUpdateDTO("Salome K", "salome", "Test");

        ObjectMapper mapper = new ObjectMapper();

        mvc.perform(put("/api/users/639f90ab2cb535157647a591")
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
    // Test PUT FORBIDDEN of object
    public void testPutUserNotPossible() throws Exception {
       
        mvc.perform(put("/api/users/639991a436f1b67db81c2a43")
                .contentType("application/json"))
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Salome Koller")))
                .andExpect(jsonPath("$.username", is("salomekoller")))
                .andExpect(jsonPath("$.email", is("kollesal@students.zhaw.ch")));
    }

    @Test
    // Test GET one object
    public void testByMail() throws Exception {
        mvc.perform(get("/api/users/email/kollesal@students.zhaw.ch").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Salome Koller")))
                .andExpect(jsonPath("$.username", is("salomekoller")))
                .andExpect(jsonPath("$.email", is("kollesal@students.zhaw.ch")));
    }

/*
     @Test
    // As this Statement would delete all my Users, this test is in a BLOCK-COMMENT
    // Test DELETE of object
    public void testDeleteAllUser() throws Exception {
        mvc.perform(delete("/api/users").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    } */

    @Test
    // Test DELETE of object
    public void testDeleteUser() throws Exception {
        mvc.perform(delete("/api/user/6378f767a8d0c73ba92fc258").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

}
