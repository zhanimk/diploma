package com.judo.competition.controller;

import com.judo.competition.model.WeightCategory;
import com.judo.competition.service.WeightCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weight-categories")
public class WeightCategoryController {

    private final WeightCategoryService weightCategoryService;

    @Autowired
    public WeightCategoryController(WeightCategoryService weightCategoryService) {
        this.weightCategoryService = weightCategoryService;
    }

    @GetMapping
    public List<WeightCategory> getAllWeightCategories() {
        return weightCategoryService.getAllWeightCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeightCategory> getWeightCategoryById(@PathVariable Long id) {
        return weightCategoryService.getWeightCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public WeightCategory createWeightCategory(@RequestBody WeightCategory weightCategory) {
        return weightCategoryService.createWeightCategory(weightCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeightCategory> updateWeightCategory(@PathVariable Long id, @RequestBody WeightCategory weightCategoryDetails) {
        try {
            return ResponseEntity.ok(weightCategoryService.updateWeightCategory(id, weightCategoryDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeightCategory(@PathVariable Long id) {
        weightCategoryService.deleteWeightCategory(id);
        return ResponseEntity.noContent().build();
    }
}
