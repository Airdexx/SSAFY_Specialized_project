package com.zeepseek.backend.domain.ranking.controller;

import com.zeepseek.backend.domain.dong.document.DongInfoDocs;
import com.zeepseek.backend.domain.dong.entity.DongInfo;
import com.zeepseek.backend.domain.dong.service.DongService;
import com.zeepseek.backend.domain.property.model.Property;
import com.zeepseek.backend.domain.property.service.PropertyService;
import com.zeepseek.backend.domain.ranking.dto.RankingResponse;
import com.zeepseek.backend.domain.ranking.service.RankingService;
import com.zeepseek.backend.domain.search.document.LogDocument;
import com.zeepseek.backend.domain.search.service.LogSearchService;
import com.zeepseek.backend.domain.user.entity.UserPreferences;
import com.zeepseek.backend.domain.user.service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;
    private final LogSearchService logSearchService;
    private final DongService dongService;
    private final PropertyService propertyService;
    private final UserServiceImpl userService;
    /**
     * 특정 dongId에 대해 ranking score가 높은 상위 5개 propertyId와 score를 조회합니다.
     *
     * @param dongId 동 아이디
     * @return 상위 5개 property의 랭킹 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getTop5Ranking(@PathVariable int userId) {
        LogDocument logDocument = logSearchService.getLatestUserLog(userId);
        String dongId = "11410555";
        UserPreferences userPreferences = userService.findByUserId(userId);
        if(userPreferences != null) dongId = String.valueOf(userPreferences.getDongId());
        if(logDocument != null) dongId = logDocument.getDongId();

        DongInfoDocs dongInfo = dongService.getDongDetail(Integer.parseInt(dongId));

        Set<org.springframework.data.redis.core.ZSetOperations.TypedTuple<Object>> topProperties =
                rankingService.getTop5PropertiesByDongId(dongId);
        // DTO 매핑: propertyId(문자열을 Long으로 변환)와 score를 포함
        List<RankingResponse> responses = topProperties.stream()
                .map(tuple -> new RankingResponse(Integer.valueOf(tuple.getValue().toString()), tuple.getScore()))
                .collect(Collectors.toList());

        List<Property> properties = new ArrayList<>();

        for(RankingResponse rank : responses) {
            Property property = propertyService.getPropertyDetail((long) rank.getPropertyId());
            properties.add(property);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("name", dongInfo.getName());
        response.put("properties", properties);

        return ResponseEntity.ok(response);
    }
}