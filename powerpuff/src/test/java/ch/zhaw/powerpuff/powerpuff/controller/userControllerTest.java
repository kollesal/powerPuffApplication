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

import ch.zhaw.powerpuff.powerpuff.model.status.UserCreateDTO;

@SpringBootTest
@AutoConfigureMockMvc
public class userControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTA5VDA4OjM1OjUzLjI1MVoiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcwNzQ5NDEzLCJleHAiOjE2NzA3ODU0MTMsInNpZCI6InR5QmFjMFFOSWZBNVJhMGVGbFNocUtNcTVBelZMdXVXIiwibm9uY2UiOiJWelF6TjBGQlFYSjJRemhqTUc4d2FWQkpjR1ZYWlhKeFpVWlliV0U1V0RsdWJVbHFUM2MyWTBZNU1RPT0ifQ.NFiPyXSwOtNnTCi6TAISdyTui4WLdufBSoJEMR9px3EnNqKcGh9eg8cmhm41d3zHUO8oZAk2EzhEB2hs8k8j5G-JX9QG3adorqw__Yd6y7lX47VLvpyUwwBFH4z4TlwyYxWQqI1BRNGtElSTLe8-0mRp_CddM2qmSJPnfP9rwNoJh7hO-OGE7voJPRzn84HD4XeWUJ_8vIjVoQF9vJvEfMm9gOZuS_Z4PzGdK31Q9gr2LrRfgVWt9OD6Y3UCrTNIZy732OB0nmhjsSxWfx6FOkOSz3sNWuE2VFrkM3uaFXzrWSch9qDF-5ii-PY8nw-1HAaPvPkE7ZC_vJ_RWSBRyA";

    @Test
    // Test GET one object
    public void testById() throws Exception {
        mvc.perform(get("/api/users/6390a5437bb4cf7efe7a59fe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Salome Koller")))
                .andExpect(jsonPath("$.username", is("salomek")))
                .andExpect(jsonPath("$.email", is("kollesal@students.zhaw.ch")));
    }

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
    // Test GET of list of objects
    public void testGetAllUsers() throws Exception {
        this.mvc.perform(get("/api/users").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    @Test
    // Test DELETE of object
    public void testDeleteUser() throws Exception {
        mvc.perform(delete("/api/user/6378f767a8d0c73ba92fc258").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    @Test
    // Test DELETE of object
    public void testDeleteAllUser() throws Exception {
        mvc.perform(delete("/api/users").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }
}
