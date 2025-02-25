//package com.nomz.doctorstudy.image.controller;
//
//import com.nomz.doctorstudy.common.dto.ErrorResponse;
//import com.nomz.doctorstudy.common.dto.SuccessResponse;
//import com.nomz.doctorstudy.image.request.ImageUploadRequest;
//import com.nomz.doctorstudy.image.request.S3UploadRequest;
//import com.nomz.doctorstudy.image.response.GetS3ImageResponse;
//import com.nomz.doctorstudy.image.response.UploadS3Response;
//import com.nomz.doctorstudy.image.service.ImageService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.media.Content;
//import io.swagger.v3.oas.annotations.media.ExampleObject;
//import io.swagger.v3.oas.annotations.media.Schema;
//import io.swagger.v3.oas.annotations.responses.ApiResponse;
//import io.swagger.v3.oas.annotations.responses.ApiResponses;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/v1/images")
//@Slf4j
//@RequiredArgsConstructor
//@Tag(name = "Image API", description = "Image API 입니다.")
//public class ImageController {
//    private final ImageService imageService;
//
//    @PostMapping()
//    @Operation(summary = "이미지 저장", description = "이미지를 s3에 저장합니다.")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "이미지 업로드 성공", useReturnTypeSchema = true),
//            @ApiResponse(responseCode = "400", description = "이미지 업로드 실패", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject("""
//                    {
//                        "message": "이미지 업로드에 실패했습니다.",
//                        "errors": {
//                        }
//                    }
//                    """))),
//    })
//    public ResponseEntity<SuccessResponse<?>> saveImg(@Valid @ModelAttribute S3UploadRequest s3UploadRequest){
//        log.info("s3UploadRequest.getFile() = {}", s3UploadRequest.getFile());
//        log.info("s3UploadRequest.getType() = {}", s3UploadRequest.getType());
//
//        UploadS3Response uploadS3Response = imageService.save(s3UploadRequest);
//
//        return ResponseEntity.ok(
//                new SuccessResponse<>("이미지 업로드에 성공했습니다.", uploadS3Response)
//        );
//    }
//
//    @GetMapping("/{imageId}")
//    @Operation(summary = "이미지 가져오기", description = "이미지를 s3에서 가져옵니다.")
//    @ApiResponses(value = {
//            @ApiResponse(responseCode = "200", description = "이미지 다운로드 성공", useReturnTypeSchema = true),
//            @ApiResponse(responseCode = "400", description = "이미지 다운로드 실패", content = @Content(schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject("""
//                    {
//                        "message": "이미지 다운로드에 실패했습니다.",
//                        "errors": {
//                        }
//                    }
//                    """))),
//    })
//    public ResponseEntity<SuccessResponse<?>> getImg(@Valid @PathVariable(name = "imageId") Long imageId){
//        log.info("imageId = {}", imageId);
//
//        String imageUrl = imageService.get(imageId);
//
//        GetS3ImageResponse getS3ImageResponse = GetS3ImageResponse
//                .builder()
//                .ImageUrl(imageUrl)
//                .build();
//
//        return ResponseEntity.ok(
//                new SuccessResponse<>("이미지 가져오기에 성공했습니다.", getS3ImageResponse)
//        );
//
//    }
//
//}
