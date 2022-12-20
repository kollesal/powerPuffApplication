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
import ch.zhaw.powerpuff.powerpuff.model.dto.UtilityUpdateDTO;
import ch.zhaw.powerpuff.powerpuff.model.types.UtilityType;

@SpringBootTest
@AutoConfigureMockMvc
public class utilityControllerTest {

    @Autowired
    private MockMvc mvc;

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIwVDEwOjEyOjQ3LjAyMloiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNTMxMTY3LCJleHAiOjE2NzE1NjcxNjcsInNpZCI6InBkaUlJVVo0UUw1ZVp4a3RvT2xDaVRrU1M1T3J2MEVnIiwibm9uY2UiOiJaalkyYWt4TVExbE5UeTFvZW1wa2FVWnFWVU5QTm5Sa1ZVcFdVREl6WVVkaFVsRlZmbTVNY2kxT1N3PT0ifQ.JLdFNRi73nvdEac0zfU4BV7lU8h3UNxa62N49YXw-xaDdH1nAdRyHoKWAweferPT0-CUW6kl7xrYaz3kyxrwq97v3cogX_feR_7YanvlSDhJg_lYzKarTLEZT7GwvNVwZPHMzXHwpfA6-85Gmaiyfqp_vLlFCt2JwMOhskuqEs9oXOIxlOHUM9X6XH6mqhbVr1DM0pXIrpNSuFRJxweahKcc8gvfftafVDs2aq_JszCutlj1bhJ2E9j3HiUqZw32asbhnLkqqpcDr951zrJlWwdFW-2zUJvUUoEQKwBgFOGOXAUqlE6mLtwVJA9MjZANDyM17sJdEHazAO4dlpGNGQ";

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
     
        UtilityUpdateDTO utilityUpdateDTO = new UtilityUpdateDTO("ScissorTest", 10, UtilityType.CUTTING);

        ObjectMapper mapper = new ObjectMapper();

        mvc.perform(patch("/api/utilities/6399d8f60eec70756b3b71ec").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken)
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(utilityUpdateDTO)))
                .andExpect(status().isOk());
    }

    @Test
    // Test FORBIDDEN PATCH of object
    public void testPatchUtilityForbidden() throws Exception {
     
        UtilityUpdateDTO utilityUpdateDTO = new UtilityUpdateDTO("ScissorTest", 10, UtilityType.CUTTING);

        ObjectMapper mapper = new ObjectMapper();

        mvc.perform(patch("/api/utilities/6399d8f60eec70756b3b71ec")
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(utilityUpdateDTO)))
                .andExpect(status().isForbidden());
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
