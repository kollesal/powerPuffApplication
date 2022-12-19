package ch.zhaw.powerpuff.powerpuff.controller;

import static org.hamcrest.core.Is.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.powerpuff.powerpuff.model.dto.UtilityCreateDTO;
import ch.zhaw.powerpuff.powerpuff.model.types.UtilityType;

@SpringBootTest
@AutoConfigureMockMvc
public class utilityControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTE4VDEwOjUyOjEwLjM5NFoiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNDMzOTk3LCJleHAiOjE2NzE0Njk5OTcsInNpZCI6Ik5mNHNicUJqWTF6eW1GMGQwcldmb1NwUUZ3VzJUQ2VWIiwibm9uY2UiOiJXbVIxVkU0NGJWUlNUMnh5VjA5bWNEZHlVbTl4TVc5aVFWVm9VMmhDUjI5UFUzNW9kMDF3Ymt0RU1BPT0ifQ.md8bB5ATZHRW-HPaLRdGy-3FbSAOq_929o0PrX5T7dQbZlyAK-5Fqsh7PX37ClH3IeTPM66FTeS2snY9Tf2K8f0mrz8AvcPRFa2REK5Zv89RvoOScz2-cbYp112sc3Au61i6XbHzMi6x03pFzfZ2hcVXxljmJJD53LR26BmPFQfd064458nFxmrHILfLFickaeKJTZ4INxxbLSqdc3MiPaAs0HID6TlpXi__OqSBwowUgleMxoGthi8ZO09d_eAKCkC1aw8P5_7f45U3EGzx-iI7E7qMzsZ1nENmRWkHyc7U8WmUclSiXNKKLhsiYQXqPYbh0875EICE7cqGdeRVtg";

    @Test
    // Test POST of object
    public void testPostNewUtility() throws Exception {
        UtilityCreateDTO u = new UtilityCreateDTO("Test", 1, UtilityType.HELP);
        ObjectMapper mapper = new ObjectMapper();
        mvc.perform(post("/api/utilities/").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(u)))
                .andExpect(status().isCreated());
    }

    @Test
    // UNAUTHORIZED POST of object
    public void testPostNewUtilityNotPossible() throws Exception {
        mvc.perform(post("/api/utilities/"))
                .andExpect(status().isForbidden());
    }

    @Test
    // Test PATCH of object
    public void testPatchUtility() throws Exception {
     
        mvc.perform(patch("/api/utilities/6399da430eec70756b3b71f5").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json"))
                .andExpect(status().isOk());
    }

    @Test
    // Test GET of list of objects
    public void testGetAllutilities() throws Exception {
        this.mvc.perform(get("/api/utilities").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    @Test
    // Test GET one object
    public void testById() throws Exception {
        mvc.perform(get("/api/utilities/6399d8cb0eec70756b3b71ea").header(HttpHeaders.AUTHORIZATION,
        "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utilityName", is("Ruler")))
                .andExpect(jsonPath("$.unit", is(1)))
                .andExpect(jsonPath("$.utilityType", is("MEASURING")));
    }

    /*
     @Test
    // As this Statement would delete all my Utilities, this test is in a BLOCK-COMMENT
    // Test DELETE of object
    public void testDeleteAllUtilities() throws Exception {
        mvc.perform(delete("/api/utilities").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    } */

    @Test
    // Test DELETE of object
    public void testDeleteUtility() throws Exception {
        mvc.perform(delete("/api/utilities/6399da3a0eec70756b3b71f4").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    
}
