package ch.zhaw.powerpuff.powerpuff.service;

//import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ch.zhaw.powerpuff.powerpuff.repository.ProductRepository;
import ch.zhaw.powerpuff.powerpuff.repository.UtilityRepository;

@Service
public class UtilityService {

    @Autowired
    UtilityRepository utilityRepository;

    @Autowired
    ProductRepository productRepository;
    
    /* 
    public Optional<Utility> assignJob(String jobId, String freelancerId) {
        if(freelancerRepository.findById(freelancerId).isPresent()) {
            Optional<Job> jobToAssign = jobRepository.findById(jobId);
        if (jobToAssign.isPresent()){
            Job job = jobToAssign.get();
            if (job.getJobState() == JobState.NEW) {

                //Neuer Zustand und FreelancerId setzen
                job.setJobState(JobState.ASSIGNED);
                job.setFreelancerId(freelancerId);
                
                //Job speichern
                jobRepository.save(job);

                return Optional.of(job);
            }
        }
    }
        return Optional.empty();
    }

    public Optional<Job> closeJob(String jobId, String comment) {
        if(jobRepository.findById(jobId).isPresent()) {
            Optional<Job> jobToClose = jobRepository.findById(jobId);
        if (jobToClose.isPresent()){
            Job job = jobToClose.get();
            if (job.getJobState() == JobState.ASSIGNED) {

                //Neuer Zustand und FreelancerId setzen
                job.setJobState(JobState.DONE);
                job.setComment(comment);
                
                //Job speichern
                jobRepository.save(job);

                return Optional.of(job);
            }
        }
    }
    return Optional.empty();
}*/

}
