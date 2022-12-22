/* package ch.zhaw.powerpuff.powerpuff.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

    public String bearerToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inc5U0pYVF9xdmRjN1YyNDVmbFRlSCJ9.eyJ1c2VyX3JvbGVzIjpbImFkbWluIl0sIm5pY2tuYW1lIjoia29sbGVzYWwiLCJuYW1lIjoia29sbGVzYWxAc3R1ZGVudHMuemhhdy5jaCIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci80NjE3MjQwMDIwZTczYWQwODg3NTlmNjZhZDYwNTc2NT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmtvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTEyLTIxVDEzOjA4OjQ3LjIxM1oiLCJlbWFpbCI6ImtvbGxlc2FsQHN0dWRlbnRzLnpoYXcuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGV2LWFjYTFqenZ1dnEzNmpnajIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzOGNjZWYxNmMxYjVjMjBkZjU3MWFkMyIsImF1ZCI6ImZGTU1NQk1yc1pyemt3N296WFNVeTcxUGk2bTV5MXFnIiwiaWF0IjoxNjcxNjM1MDc2LCJleHAiOjE2NzE2NzEwNzYsInNpZCI6IkhEcnZUcjFybzFGVjRCUDNKS2pmZDRBbEEyaFI3REpWIiwibm9uY2UiOiJTSGRKZVRKd2RsUlRVVk50VFZsbFEyUlBTak5vWDIxVk0wMVFMa0ZtV1U1Q1YwOXNPRkZHZGxBMll3PT0ifQ.WKNotklKWHyTE_mD6xPjKSU9njUp8-Mn4H8WrwpBzTs0KGYcorf27fJ3L6k6dckevd-m0eAJFRh_EqzG6AQwlMisHxxFQB3vNg80kL5zffCrIYkVOLg-3_zSVKXPA4ieknNBcz9Y_kzEPM-T0gfNoZqOlG6jq-BFyxyERg4eWeEP9ZsQiNFQ9xMpG0kr76ZFQkTRQjY4pWB1o3NWv37OOmEX2ybYEGMZBYl2WSSe7LMOu47EXwtcta5FvdpsSQzg4tK4muUGOsIAG6R3VAxb-JXiFK_vSlnA6DdQAY89zlRYVCXzw6buD6_ZurHvrPE_9x6YAjl_AwyYMoQw5eHJeQ";

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

        mvc.perform(patch("/api/utilities/6399daec0eec70756b3b7201").header(HttpHeaders.AUTHORIZATION,
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
                .andExpect(status().isOk());
    }

    
    //   @Test
    // // As this Statement would delete all my Utilities, this test is in a BLOCK-COMMENT
    // // Test DELETE of object
    // public void testDeleteAllUtilities() throws Exception {
    //     mvc.perform(delete("/api/utilities").header(HttpHeaders.AUTHORIZATION,
    //             "Bearer " + bearerToken))
    //             .andExpect(status().isOk());
    // }  

    @Test
    // Test DELETE of object
    public void testDeleteUtility() throws Exception {
        mvc.perform(delete("/api/utilities/63a32c4727517053c9fa07ad").header(HttpHeaders.AUTHORIZATION,
                "Bearer " + bearerToken))
                .andExpect(status().isOk());
    }

    
}
  */