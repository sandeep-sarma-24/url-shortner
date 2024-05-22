package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
        "github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	shortURLLength = 7
)

type URLService struct {
	elements string
	mux      sync.Mutex
}

func NewURLService() *URLService {
	return &URLService{
		elements: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	}
}

func (s *URLService) base62ToBase10(str string) int {
	n := 0
	for _, char := range str {
		n = n*62 + s.convert(char)
	}
	return n
}

func (s *URLService) convert(c rune) int {
	if c >= '0' && c <= '9' {
		return int(c - '0')
	}
	if c >= 'a' && c <= 'z' {
		return int(c - 'a' + 10)
	}
	if c >= 'A' && c <= 'Z' {
		return int(c - 'A' + 36)
	}
	return -1
}

func (s *URLService) longToShort(longURL string) string {
	s.mux.Lock()
	defer s.mux.Unlock()

	// Append current timestamp to the long URL to ensure uniqueness
	longURL += strconv.FormatInt(time.Now().UnixNano(), 10)

	base10 := s.base62ToBase10(longURL)
	base10Str := fmt.Sprintf("%d", base10)
	// Take the first 7 characters of the base10 representation
	base10Str = base10Str[:shortURLLength]

	// Generate MD5 hash of the base10 string
	hash := md5.Sum([]byte(base10Str))
	md5Hash := hex.EncodeToString(hash[:])[:shortURLLength] // Take only first 7 characters of MD5 hash

	shortURL := os.Getenv("BASE_URL") + md5Hash
	return shortURL
}

func main() {

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
	}

	service := NewURLService()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://52.13.22.149:5173", "http://52.13.22.149:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
        }))

	r.POST("/api/shorten", func(c *gin.Context) {
		var req struct {
			LongURL string `json:"long_url" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		shortURL := service.longToShort(req.LongURL)
		c.JSON(http.StatusOK, gin.H{"short_url": shortURL})
	})

	r.GET("/:shortURL", func(c *gin.Context) {
		shortURL := c.Param("shortURL")

		// Extract the MD5 hash from the short URL
		md5Hash := shortURL[len(os.Getenv("BASE_URL")) : len(os.Getenv("BASE_URL"))+shortURLLength]

		// Decode the MD5 hash
		hash, err := hex.DecodeString(md5Hash)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Short URL not found"})
			return
		}

		// Reverse the MD5 hash to get the base10 string
		base10Str := string(hash[:])

		// Convert the base10 string back to base62
		base10, err := strconv.Atoi(base10Str)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Short URL not found"})
			return
		}

		var base62Builder strings.Builder
		for base10 > 0 {
			remainder := base10 % 62
			base62Builder.WriteString(string(service.elements[remainder]))
			base10 /= 62
		}
		base62 := base62Builder.String()

		// Reverse the base62 string to get the original long URL
		var longURLBuilder strings.Builder
		for i := len(base62) - 1; i >= 0; i-- {
			longURLBuilder.WriteString(string(base62[i]))
		}
		longURL := longURLBuilder.String()

		c.Redirect(http.StatusMovedPermanently, longURL)
	})

	port := os.Getenv("PORT")
	r.Run(":" + port)
}
