package ch.zhaw.powerpuff.powerpuff.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.core.Is.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.UserCreateDTO;

@SpringBootTest
@AutoConfigureMockMvc
public class userControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTE4VDEwOjUyOjEwLjM5NFoiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxMzk4NTQ1LCJleHAiOjE2NzE0MzQ1NDUsInNpZCI6Ik5mNHNicUJqWTF6eW1GMGQwcldmb1NwUUZ3VzJUQ2VWIiwibm9uY2UiOiJUbWc1WTBWc1IwUm5Ta2hoY21WemREWlFkM1pvVjBSd1RtRlBRbkZrYjNBMVVIa3lRalZxYm10VVJRPT0ifQ.kUtEShgiw_Wevmf-26hZenwetEa-mz1AI-NiCEPMzY8o1j1bSqMZKLf9mbwOAN2wlI7ItHkGJLmBN4hQho7F9q_858CsLCh11-YZJC-Zn1Dbkl0EJB4mCnnVxQvuc4KXm2y6il15doZUEkOLut57Y16Ue6foSGhla1NqIqC0I3Aw0_bfb-NGJNhd46QHgoBRBa9rS-dpIm6T7-ew4YABYA0gaRcMcqsSJNMuIJ1ccVk9IhmMtTlNzaPVNS3UFXMRzK4b7R1fA9e0FRfMU9fyOwS-vZbkMVjah-nG280641ehENqmnomD_Izj3l1TUAFgHOHpjpW8J3vaE91uHYa7BA";

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

    // Test PUT of object

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
    // UNAUTHORIZED GET one object
    public void testDoNotGetById() throws Exception {
        mvc.perform(get("/api/users/6390a5437bb4cf7efe7a59fe"))
                .andExpect(status().isUnauthorized());
    }


    @Test
    // Test DELETE of object
    public void testDeleteUser() throws Exception {
        mvc.perform(delete("/api/user/6378f767a8d0c73ba92fc258").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

   /*  @Test
    // As this Statement would delete all my Users, this test is in a BLOCK-COMMENT
    // Test DELETE of object
    public void testDeleteAllUser() throws Exception {
        mvc.perform(delete("/api/users").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    } */
}
