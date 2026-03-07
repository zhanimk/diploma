package com.judo.competition.service;

import com.judo.competition.model.WeightCategory;
import com.judo.competition.repository.WeightCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WeightCategoryService {

    private final WeightCategoryRepository weightCategoryRepository;

    @Autowired
    public WeightCategoryService(WeightCategoryRepository weightCategoryRepository) {
        this.weightCategoryRepository = weightCategoryRepository;
    }

    public List<WeightCategory> getAllWeightCategories() {
        return weightCategoryRepository.findAll();
    }

    public Optional<WeightCategory> getWeightCategoryById(Long id) {
        return weightCategoryRepository.findById(id);
    }

    public WeightCategory createWeightCategory(WeightCategory weightCategory) {
        return weightCategoryRepository.save(weightCategory);
    }

    public WeightCategory updateWeightCategory(Long id, WeightCategory weightCategoryDetails) {
        WeightCategory weightCategory = weightCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Weight category not found"));
        weightCategory.setName(weightCategoryDetails.getName());
        weightCategory.setMaxWeight(weightCategoryDetails.getMaxWeight());
        return weightCategoryRepository.save(weightCategory);
    }

    public void deleteWeightCategory(Long id) {
        weightCategoryRepository.deleteById(id);
    }
}
