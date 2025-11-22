package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type Product struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Price       float64  `json:"price"`
	Rating      float64  `json:"rating"`
	Reviews     int      `json:"reviews"`
	Description string   `json:"description"`
	Image       string   `json:"image"`  // Main image (for backward compatibility)
	Images      []string `json:"images"` // Array of images
	Color       string   `json:"color"`
	Dimensions  string   `json:"dimensions"`
	Material    string   `json:"material"`
	Features    []string `json:"features"`
	Featured    bool     `json:"featured"` // Recommended product flag
}

type Category struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Href        string `json:"href"`
	Image       string `json:"image"`
}

type Collection struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	Count       int       `json:"count"`
	Products    []Product `json:"products,omitempty"`
}

type Contact struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type Placeholder struct {
	ID          int    `json:"id"`
	Path        string `json:"path"`
	Title       string `json:"title"`
	Message     string `json:"message"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type FAQ struct {
	ID       int    `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Order    int    `json:"order"`
}

var db *sql.DB

func initDB() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=db user=luxe password=luxe123 dbname=luxe_db sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Wait for database to be ready
	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Printf("Waiting for database... attempt %d/10", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Database connected successfully")

	// Create tables
	createTables()
	// Initialize default data if tables are empty
	initDefaultData()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(100) NOT NULL,
			price DECIMAL(10,2) NOT NULL,
			rating DECIMAL(3,1) DEFAULT 0,
			reviews INTEGER DEFAULT 0,
			description TEXT,
			image VARCHAR(500),
			images TEXT,
			color VARCHAR(50),
			dimensions VARCHAR(100),
			material VARCHAR(255),
			features TEXT,
			featured BOOLEAN DEFAULT FALSE
		)`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE`,
		`CREATE TABLE IF NOT EXISTS categories (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			icon VARCHAR(50),
			href VARCHAR(255),
			image VARCHAR(500)
		)`,
		`ALTER TABLE categories ADD COLUMN IF NOT EXISTS href VARCHAR(255)`,
		`ALTER TABLE categories ADD COLUMN IF NOT EXISTS image VARCHAR(500)`,
		`CREATE TABLE IF NOT EXISTS collections (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			image VARCHAR(500),
			count INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS collection_products (
			collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
			product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
			PRIMARY KEY (collection_id, product_id)
		)`,
		`CREATE TABLE IF NOT EXISTS contacts (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			phone VARCHAR(50),
			message TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS placeholders (
			id SERIAL PRIMARY KEY,
			path VARCHAR(500) NOT NULL UNIQUE,
			title VARCHAR(255) NOT NULL,
			message TEXT,
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS faqs (
			id SERIAL PRIMARY KEY,
			question TEXT NOT NULL,
			answer TEXT NOT NULL,
			"order" INTEGER DEFAULT 0
		)`,
	}

	for _, query := range queries {
		_, err := db.Exec(query)
		if err != nil {
			log.Printf("Error creating table: %v", err)
		}
	}
}

func initDefaultData() {
	// Check if products table is empty
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		log.Printf("Error checking products count: %v", err)
		return
	}

	if count == 0 {
		log.Println("Initializing default data...")
		defaultProducts := []Product{
			{Name: "Роскошная кровать King Size", Category: "Кровати", Price: 2499, Rating: 4.8, Reviews: 124, Description: "Опыт роскоши с нашей кроватью King Size ручной работы", Image: "/luxury-king-bed-frame.jpg", Color: "Коричневый", Dimensions: "210cm × 160cm × 120cm", Material: "Премиальная твердая древесина, высококачественная ткань", Features: []string{"Ручная резьба", "Рама из премиальной древесины", "Включает премиальный матрас", "Настраиваемое изголовье", "Гарантия 5 лет"}},
			{Name: "Современное кресло для гостиной", Category: "Мебель для сидения", Price: 899, Rating: 4.7, Reviews: 89, Description: "Современный комфорт встречается со стилем", Image: "/modern-lounge-chair.png", Color: "Серый", Dimensions: "85cm × 95cm × 85cm", Material: "Премиальная обивка, деревянная рама", Features: []string{"Эргономичный дизайн", "Прочная обивка", "Легко чистить", "Доступно в нескольких цветах", "Гарантия 3 года"}},
			{Name: "Конференц-стол Executive", Category: "Столовая мебель", Price: 3200, Rating: 4.9, Reviews: 156, Description: "Впечатлите клиентов и гостей этим потрясающим конференц-столом", Image: "/modern-conference-table.jpg", Color: "Орех", Dimensions: "240cm × 120cm × 75cm", Material: "Премиальный орех, металлическое основание", Features: []string{"Вмещает 12 человек", "Шпон ореха", "Металлическое основание", "Управление кабелями", "Гарантия 7 лет"}},
			{Name: "Мраморный прикроватный столик", Category: "Декор", Price: 599, Rating: 4.6, Reviews: 67, Description: "Элегантный мраморный столик", Image: "/marble-luxury-side-table.jpg", Color: "Белый", Dimensions: "50cm × 50cm × 60cm", Material: "Мрамор, металл", Features: []string{"Премиальный мрамор", "Металлические ножки", "Легко чистить", "Гарантия 2 года"}},
			{Name: "Премиальная кровать Queen Size", Category: "Кровати", Price: 1999, Rating: 4.8, Reviews: 98, Description: "Роскошная кровать Queen Size", Image: "/luxury-king-bed-frame.jpg", Color: "Черный", Dimensions: "200cm × 160cm × 120cm", Material: "Твердая древесина", Features: []string{"Прочная конструкция", "Элегантный дизайн", "Гарантия 5 лет"}},
			{Name: "Современное акцентное кресло", Category: "Мебель для сидения", Price: 749, Rating: 4.5, Reviews: 45, Description: "Стильное акцентное кресло", Image: "/modern-lounge-chair.png", Color: "Бежевый", Dimensions: "80cm × 90cm × 80cm", Material: "Ткань, дерево", Features: []string{"Современный дизайн", "Удобное", "Гарантия 3 года"}},
		}

		for _, p := range defaultProducts {
			featuresStr := strings.Join(p.Features, ",")
			_, err := db.Exec(
				"INSERT INTO products (name, category, price, rating, reviews, description, image, color, dimensions, material, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
				p.Name, p.Category, p.Price, p.Rating, p.Reviews, p.Description, p.Image, p.Color, p.Dimensions, p.Material, featuresStr,
			)
			if err != nil {
				log.Printf("Error inserting default product: %v", err)
			}
		}

		defaultCategories := []Category{
			{Name: "Кровати и матрасы", Description: "Премиальные решения для сна", Icon: "Bed", Href: "/catalog?category=beds", Image: "/img/screenshot-hero.jpg"},
			{Name: "Мебель для сидения", Description: "Удобная мебель для гостиных", Icon: "Armchair", Href: "/catalog?category=seating", Image: "/img/screenshot-hero.jpg"},
			{Name: "Столовая мебель", Description: "Элегантные решения для столовой", Icon: "TrendingUp", Href: "/catalog?category=dining", Image: "/img/screenshot-hero.jpg"},
			{Name: "Декор и аксессуары", Description: "Финальные штрихи", Icon: "Sofa", Href: "/catalog?category=decor", Image: "/img/screenshot-hero.jpg"},
		}

		for _, c := range defaultCategories {
			_, err := db.Exec("INSERT INTO categories (name, description, icon, href, image) VALUES ($1, $2, $3, $4, $5)", c.Name, c.Description, c.Icon, c.Href, c.Image)
			if err != nil {
				log.Printf("Error inserting default category: %v", err)
			}
		}

		defaultCollections := []Collection{
			{Name: "Современный минимализм", Description: "Чистые линии и современный дизайн", Image: "/modern-minimalist-furniture-collection.jpg", Count: 24},
			{Name: "Классическая элегантность", Description: "Вневременные изделия с изысканными деталями", Image: "/classical-elegant-furniture-collection.jpg", Count: 18},
			{Name: "Роскошный курорт", Description: "Разработано для премиального гостеприимства", Image: "/luxury-resort-furniture-collection.jpg", Count: 32},
		}

		for _, c := range defaultCollections {
			_, err := db.Exec("INSERT INTO collections (name, description, image, count) VALUES ($1, $2, $3, $4)", c.Name, c.Description, c.Image, c.Count)
			if err != nil {
				log.Printf("Error inserting default collection: %v", err)
			}
		}

		// Initialize default FAQs
		var faqCount int
		err = db.QueryRow("SELECT COUNT(*) FROM faqs").Scan(&faqCount)
		if err == nil && faqCount == 0 {
			defaultFAQs := []FAQ{
				{Question: "Как долго занимает доставка мебели?", Answer: "Стандартная доставка занимает от 4 до 8 недель с момента подтверждения заказа. Для срочных заказов доступна экспресс-доставка в течение 2-3 недель. Сроки могут варьироваться в зависимости от сложности изделия и текущей загрузки производства.", Order: 1},
				{Question: "Предоставляете ли вы услуги дизайна интерьера?", Answer: "Да, мы предлагаем полный спектр услуг по дизайну интерьеров для отелей. Наша команда дизайнеров поможет создать концепцию, подобрать мебель и аксессуары, а также разработать детальный план реализации проекта.", Order: 2},
				{Question: "Можно ли заказать мебель по индивидуальным размерам?", Answer: "Абсолютно! Мы специализируемся на создании мебели по индивидуальным проектам. Наши мастера могут изготовить изделия любых размеров и конфигураций, учитывая специфику вашего пространства и дизайнерские требования.", Order: 3},
				{Question: "Какие гарантии вы предоставляете?", Answer: "Мы предоставляем гарантию от 2 до 7 лет в зависимости от типа изделия. Гарантия покрывает производственные дефекты и проблемы с материалами. Также мы предлагаем послегарантийное обслуживание и ремонт.", Order: 4},
				{Question: "Работаете ли вы с международными заказами?", Answer: "Да, мы осуществляем доставку по всему миру. У нас есть опыт работы с отелями в Европе, Азии, Америке и других регионах. Мы берем на себя все вопросы логистики и таможенного оформления.", Order: 5},
				{Question: "Какие способы оплаты вы принимаете?", Answer: "Мы принимаем различные способы оплаты: банковские переводы, кредитные карты, аккредитивы. Для крупных проектов возможна оплата поэтапно. Все финансовые условия обсуждаются индивидуально при заключении договора.", Order: 6},
				{Question: "Можно ли посмотреть мебель перед покупкой?", Answer: "Да, у нас есть выставочный зал, где вы можете увидеть образцы нашей продукции. Также мы можем организовать выездную презентацию для крупных проектов. Для международных клиентов доступны виртуальные туры и видеоконференции.", Order: 7},
				{Question: "Предоставляете ли вы услуги по установке?", Answer: "Да, мы предлагаем полный комплекс услуг, включая доставку, разгрузку и профессиональную установку мебели. Наши специалисты обеспечат правильную сборку и размещение всех элементов согласно дизайн-проекту.", Order: 8},
			}

			for _, faq := range defaultFAQs {
				_, err := db.Exec("INSERT INTO faqs (question, answer, \"order\") VALUES ($1, $2, $3)", faq.Question, faq.Answer, faq.Order)
				if err != nil {
					log.Printf("Error inserting default FAQ: %v", err)
				}
			}
		}

		log.Println("Default data initialized")
	}
}

// Products CRUD
func getProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, category, price, rating, reviews, description, image, images, color, dimensions, material, features, featured FROM products ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var featuresStr, imagesStr sql.NullString
		err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Rating, &p.Reviews, &p.Description, &p.Image, &imagesStr, &p.Color, &p.Dimensions, &p.Material, &featuresStr, &p.Featured)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if featuresStr.Valid && featuresStr.String != "" {
			p.Features = strings.Split(featuresStr.String, ",")
		}
		// Parse images JSON array
		if imagesStr.Valid && imagesStr.String != "" {
			json.Unmarshal([]byte(imagesStr.String), &p.Images)
		}
		// If no images array but has main image, use it
		if len(p.Images) == 0 && p.Image != "" {
			p.Images = []string{p.Image}
		}
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func getFeaturedProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, category, price, rating, reviews, description, image, images, color, dimensions, material, features, featured FROM products WHERE featured = TRUE ORDER BY id LIMIT 8")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var featuresStr, imagesStr sql.NullString
		err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Rating, &p.Reviews, &p.Description, &p.Image, &imagesStr, &p.Color, &p.Dimensions, &p.Material, &featuresStr, &p.Featured)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if featuresStr.Valid && featuresStr.String != "" {
			p.Features = strings.Split(featuresStr.String, ",")
		}
		// Parse images JSON array
		if imagesStr.Valid && imagesStr.String != "" {
			json.Unmarshal([]byte(imagesStr.String), &p.Images)
		}
		// If no images array but has main image, use it
		if len(p.Images) == 0 && p.Image != "" {
			p.Images = []string{p.Image}
		}
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func getProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var p Product
	var featuresStr, imagesStr sql.NullString
	err = db.QueryRow(
		"SELECT id, name, category, price, rating, reviews, description, image, images, color, dimensions, material, features, featured FROM products WHERE id = $1",
		id,
	).Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Rating, &p.Reviews, &p.Description, &p.Image, &imagesStr, &p.Color, &p.Dimensions, &p.Material, &featuresStr, &p.Featured)

	if err == sql.ErrNoRows {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if featuresStr.Valid && featuresStr.String != "" {
		p.Features = strings.Split(featuresStr.String, ",")
	}
	// Parse images JSON array
	if imagesStr.Valid && imagesStr.String != "" {
		json.Unmarshal([]byte(imagesStr.String), &p.Images)
	}
	// If no images array but has main image, use it
	if len(p.Images) == 0 && p.Image != "" {
		p.Images = []string{p.Image}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	featuresStr := strings.Join(product.Features, ",")

	// Set main image from images array if not set
	if product.Image == "" && len(product.Images) > 0 {
		product.Image = product.Images[0]
	}

	// Convert images array to JSON
	imagesJSON, _ := json.Marshal(product.Images)
	imagesStr := string(imagesJSON)

	err := db.QueryRow(
		"INSERT INTO products (name, category, price, rating, reviews, description, image, images, color, dimensions, material, features, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id",
		product.Name, product.Category, product.Price, product.Rating, product.Reviews, product.Description, product.Image, imagesStr, product.Color, product.Dimensions, product.Material, featuresStr, product.Featured,
	).Scan(&product.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func updateProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	featuresStr := strings.Join(product.Features, ",")

	// Set main image from images array if not set
	if product.Image == "" && len(product.Images) > 0 {
		product.Image = product.Images[0]
	}

	// Convert images array to JSON
	imagesJSON, _ := json.Marshal(product.Images)
	imagesStr := string(imagesJSON)

	result, err := db.Exec(
		"UPDATE products SET name=$1, category=$2, price=$3, rating=$4, reviews=$5, description=$6, image=$7, images=$8, color=$9, dimensions=$10, material=$11, features=$12, featured=$13 WHERE id=$14",
		product.Name, product.Category, product.Price, product.Rating, product.Reviews, product.Description, product.Image, imagesStr, product.Color, product.Dimensions, product.Material, featuresStr, product.Featured, id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	product.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Categories CRUD
func getCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, description, icon, href, image FROM categories ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var c Category
		var href, image sql.NullString
		err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.Icon, &href, &image)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if href.Valid {
			c.Href = href.String
		}
		if image.Valid {
			c.Image = image.String
		}
		categories = append(categories, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func createCategory(w http.ResponseWriter, r *http.Request) {
	var category Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO categories (name, description, icon, href, image) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		category.Name, category.Description, category.Icon, category.Href, category.Image,
	).Scan(&category.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

func updateCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	var category Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE categories SET name=$1, description=$2, icon=$3, href=$4, image=$5 WHERE id=$6",
		category.Name, category.Description, category.Icon, category.Href, category.Image, id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	category.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

func deleteCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Collections CRUD
func getCollections(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, description, image FROM collections ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var collections []Collection
	for rows.Next() {
		var c Collection
		err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.Image)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Count products in collection
		var count int
		db.QueryRow("SELECT COUNT(*) FROM collection_products WHERE collection_id = $1", c.ID).Scan(&count)
		c.Count = count
		collections = append(collections, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collections)
}

func getCollection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}

	var collection Collection
	err = db.QueryRow(
		"SELECT id, name, description, image, count FROM collections WHERE id = $1",
		id,
	).Scan(&collection.ID, &collection.Name, &collection.Description, &collection.Image, &collection.Count)

	if err == sql.ErrNoRows {
		http.Error(w, "Collection not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get products in this collection
	productRows, err := db.Query(`
		SELECT p.id, p.name, p.category, p.price, p.rating, p.reviews, p.description, 
		       p.image, p.images, p.color, p.dimensions, p.material, p.features, p.featured
		FROM products p
		INNER JOIN collection_products cp ON p.id = cp.product_id
		WHERE cp.collection_id = $1
		ORDER BY p.id
	`, id)
	if err == nil {
		defer productRows.Close()
		var products []Product
		for productRows.Next() {
			var p Product
			var featuresStr, imagesStr sql.NullString
			err := productRows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Rating, &p.Reviews, &p.Description,
				&p.Image, &imagesStr, &p.Color, &p.Dimensions, &p.Material, &featuresStr, &p.Featured)
			if err == nil {
				if featuresStr.Valid && featuresStr.String != "" {
					p.Features = strings.Split(featuresStr.String, ",")
				}
				if imagesStr.Valid && imagesStr.String != "" {
					json.Unmarshal([]byte(imagesStr.String), &p.Images)
				}
				if len(p.Images) == 0 && p.Image != "" {
					p.Images = []string{p.Image}
				}
				products = append(products, p)
			}
		}
		collection.Products = products
		collection.Count = len(products)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collection)
}

func createCollection(w http.ResponseWriter, r *http.Request) {
	var collection Collection
	if err := json.NewDecoder(r.Body).Decode(&collection); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO collections (name, description, image, count) VALUES ($1, $2, $3, 0) RETURNING id",
		collection.Name, collection.Description, collection.Image,
	).Scan(&collection.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	collection.Count = 0
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(collection)
}

func updateCollection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}

	var collection Collection
	if err := json.NewDecoder(r.Body).Decode(&collection); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Don't update count manually - it's calculated from collection_products
	result, err := db.Exec(
		"UPDATE collections SET name=$1, description=$2, image=$3 WHERE id=$4",
		collection.Name, collection.Description, collection.Image, id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Collection not found", http.StatusNotFound)
		return
	}

	collection.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collection)
}

func deleteCollection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM collections WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Collection not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Collection Products Management
func addProductToCollection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	collectionID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}

	var req struct {
		ProductID int `json:"product_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"INSERT INTO collection_products (collection_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		collectionID, req.ProductID,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update count
	db.Exec("UPDATE collections SET count = (SELECT COUNT(*) FROM collection_products WHERE collection_id = $1) WHERE id = $1", collectionID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func removeProductFromCollection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	collectionID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid collection ID", http.StatusBadRequest)
		return
	}

	productID, err := strconv.Atoi(vars["product_id"])
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"DELETE FROM collection_products WHERE collection_id = $1 AND product_id = $2",
		collectionID, productID,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update count
	db.Exec("UPDATE collections SET count = (SELECT COUNT(*) FROM collection_products WHERE collection_id = $1) WHERE id = $1", collectionID)

	w.WriteHeader(http.StatusNoContent)
}

func uploadImage(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Error creating upload directory", http.StatusInternalServerError)
		return
	}

	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, handler.Filename)
	filepath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url":      fmt.Sprintf("/uploads/%s", filename),
		"filename": filename,
	})
}

// Contacts CRUD
func createContact(w http.ResponseWriter, r *http.Request) {
	var contact Contact
	if err := json.NewDecoder(r.Body).Decode(&contact); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
		contact.Name, contact.Email, contact.Phone, contact.Message,
	).Scan(&contact.ID, &contact.CreatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(contact)
}

func getContacts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, email, phone, message, created_at FROM contacts ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var contacts []Contact
	for rows.Next() {
		var c Contact
		err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &c.Message, &c.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		contacts = append(contacts, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}

func deleteContact(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid contact ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM contacts WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Contact not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Placeholders Management
func getPlaceholders(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, path, title, message, is_active, created_at FROM placeholders ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var placeholders []Placeholder
	for rows.Next() {
		var p Placeholder
		err := rows.Scan(&p.ID, &p.Path, &p.Title, &p.Message, &p.IsActive, &p.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		placeholders = append(placeholders, p)
	}

	// Ensure we return an empty array instead of null
	if placeholders == nil {
		placeholders = []Placeholder{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(placeholders)
}

func getPlaceholder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid placeholder ID", http.StatusBadRequest)
		return
	}

	var placeholder Placeholder
	err = db.QueryRow(
		"SELECT id, path, title, message, is_active, created_at FROM placeholders WHERE id = $1",
		id,
	).Scan(&placeholder.ID, &placeholder.Path, &placeholder.Title, &placeholder.Message, &placeholder.IsActive, &placeholder.CreatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Placeholder not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(placeholder)
}

func checkPlaceholder(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		http.Error(w, "Path parameter is required", http.StatusBadRequest)
		return
	}

	var placeholder Placeholder
	err := db.QueryRow(
		"SELECT id, path, title, message, is_active, created_at FROM placeholders WHERE path = $1 AND is_active = TRUE",
		path,
	).Scan(&placeholder.ID, &placeholder.Path, &placeholder.Title, &placeholder.Message, &placeholder.IsActive, &placeholder.CreatedAt)

	if err == sql.ErrNoRows {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"exists": false})
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"exists": true, "placeholder": placeholder})
}

func createPlaceholder(w http.ResponseWriter, r *http.Request) {
	var placeholder Placeholder
	if err := json.NewDecoder(r.Body).Decode(&placeholder); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO placeholders (path, title, message, is_active) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
		placeholder.Path, placeholder.Title, placeholder.Message, placeholder.IsActive,
	).Scan(&placeholder.ID, &placeholder.CreatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(placeholder)
}

func updatePlaceholder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid placeholder ID", http.StatusBadRequest)
		return
	}

	var placeholder Placeholder
	if err := json.NewDecoder(r.Body).Decode(&placeholder); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE placeholders SET path=$1, title=$2, message=$3, is_active=$4 WHERE id=$5",
		placeholder.Path, placeholder.Title, placeholder.Message, placeholder.IsActive, id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Placeholder not found", http.StatusNotFound)
		return
	}

	placeholder.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(placeholder)
}

func deletePlaceholder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid placeholder ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM placeholders WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Placeholder not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Database dump functions
func createDump(w http.ResponseWriter, r *http.Request) {
	// Get database connection details from environment
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "db"
	}
	dbUser := os.Getenv("POSTGRES_USER")
	if dbUser == "" {
		dbUser = "luxe"
	}
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	if dbPassword == "" {
		dbPassword = "luxe123"
	}
	dbName := os.Getenv("POSTGRES_DB")
	if dbName == "" {
		dbName = "luxe_db"
	}

	// Create dumps directory if it doesn't exist
	dumpDir := "./dumps"
	if err := os.MkdirAll(dumpDir, os.ModePerm); err != nil {
		http.Error(w, "Error creating dump directory", http.StatusInternalServerError)
		return
	}

	// Generate dump filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	dumpFilename := fmt.Sprintf("dump_%s.dump", timestamp)
	dumpPath := filepath.Join(dumpDir, dumpFilename)

	// Create pg_dump command
	cmd := exec.Command("pg_dump",
		"-h", dbHost,
		"-U", dbUser,
		"-d", dbName,
		"-F", "c", // Custom format
		"-f", dumpPath,
	)
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", dbPassword))

	// Execute dump
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		log.Printf("Dump error: %s", stderr.String())
		http.Error(w, fmt.Sprintf("Error creating dump: %s", stderr.String()), http.StatusInternalServerError)
		return
	}

	// Check if file was created
	if _, err := os.Stat(dumpPath); os.IsNotExist(err) {
		http.Error(w, "Dump file was not created", http.StatusInternalServerError)
		return
	}

	// Send dump to Telegram if configured
	telegramBotToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	telegramChatID := os.Getenv("TELEGRAM_CHAT_ID")
	telegramSent := false
	if telegramBotToken != "" && telegramChatID != "" {
		if err := sendDumpToTelegram(telegramBotToken, telegramChatID, dumpPath, dumpFilename); err != nil {
			log.Printf("Error sending dump to Telegram: %v", err)
			// Don't fail the request if Telegram send fails
		} else {
			telegramSent = true
		}
	}

	// Return dump info
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "success",
		"filename":     dumpFilename,
		"path":         fmt.Sprintf("/dumps/%s", dumpFilename),
		"size":         getFileSize(dumpPath),
		"telegram_sent": telegramSent,
	})
}

func sendDumpToTelegram(botToken, chatID, filePath, filename string) error {
	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	// Get file info
	fileInfo, err := file.Stat()
	if err != nil {
		return err
	}

	// Create multipart form
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add chat_id field
	writer.WriteField("chat_id", chatID)
	writer.WriteField("caption", fmt.Sprintf("Database dump: %s\nSize: %.2f MB", filename, float64(fileInfo.Size())/1024/1024))

	// Add document field
	part, err := writer.CreateFormFile("document", filename)
	if err != nil {
		return err
	}
	_, err = io.Copy(part, file)
	if err != nil {
		return err
	}
	writer.Close()

	// Send to Telegram
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendDocument", botToken)
	req, err := http.NewRequest("POST", url, &requestBody)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Telegram API error: %s", string(body))
	}

	return nil
}

func restoreDump(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form
	err := r.ParseMultipartForm(100 << 20) // 100MB max
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Get uploaded file
	file, handler, err := r.FormFile("dump")
	if err != nil {
		http.Error(w, "Error retrieving dump file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Get database connection details
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "db"
	}
	dbUser := os.Getenv("POSTGRES_USER")
	if dbUser == "" {
		dbUser = "luxe"
	}
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	if dbPassword == "" {
		dbPassword = "luxe123"
	}
	dbName := os.Getenv("POSTGRES_DB")
	if dbName == "" {
		dbName = "luxe_db"
	}

	// Create temporary file for dump
	dumpDir := "./dumps"
	if err := os.MkdirAll(dumpDir, os.ModePerm); err != nil {
		http.Error(w, "Error creating dump directory", http.StatusInternalServerError)
		return
	}

	timestamp := time.Now().Format("20060102_150405")
	tempDumpPath := filepath.Join(dumpDir, fmt.Sprintf("restore_%s_%s", timestamp, handler.Filename))

	// Save uploaded file
	dst, err := os.Create(tempDumpPath)
	if err != nil {
		http.Error(w, "Error creating temp file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Error saving dump file", http.StatusInternalServerError)
		return
	}
	dst.Close()

	// Determine dump format and restore
	var cmd *exec.Cmd
	if strings.HasSuffix(handler.Filename, ".sql") {
		// SQL format
		cmd = exec.Command("psql",
			"-h", dbHost,
			"-U", dbUser,
			"-d", dbName,
			"-f", tempDumpPath,
		)
	} else {
		// Custom format (pg_restore)
		cmd = exec.Command("pg_restore",
			"-h", dbHost,
			"-U", dbUser,
			"-d", dbName,
			"-c", // Clean (drop) database objects before recreating
			"-v", // Verbose
			tempDumpPath,
		)
	}

	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", dbPassword))

	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		log.Printf("Restore error: %s", stderr.String())
		os.Remove(tempDumpPath) // Clean up
		http.Error(w, fmt.Sprintf("Error restoring dump: %s", stderr.String()), http.StatusInternalServerError)
		return
	}

	// Clean up temp file
	os.Remove(tempDumpPath)

	// Reconnect to database to ensure connection is fresh
	db.Close()
	initDB()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Database restored successfully",
	})
}

func getFileSize(filePath string) int64 {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0
	}
	return info.Size()
}

// FAQ CRUD
func getFAQs(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, question, answer, \"order\" FROM faqs ORDER BY \"order\" ASC, id ASC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var faqs []FAQ
	for rows.Next() {
		var faq FAQ
		err := rows.Scan(&faq.ID, &faq.Question, &faq.Answer, &faq.Order)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		faqs = append(faqs, faq)
	}

	w.Header().Set("Content-Type", "application/json")
	if faqs == nil {
		json.NewEncoder(w).Encode([]FAQ{})
	} else {
		json.NewEncoder(w).Encode(faqs)
	}
}

func getFAQ(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid FAQ ID", http.StatusBadRequest)
		return
	}

	var faq FAQ
	err = db.QueryRow("SELECT id, question, answer, \"order\" FROM faqs WHERE id = $1", id).Scan(&faq.ID, &faq.Question, &faq.Answer, &faq.Order)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "FAQ not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(faq)
}

func createFAQ(w http.ResponseWriter, r *http.Request) {
	var faq FAQ
	if err := json.NewDecoder(r.Body).Decode(&faq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO faqs (question, answer, \"order\") VALUES ($1, $2, $3) RETURNING id",
		faq.Question, faq.Answer, faq.Order,
	).Scan(&faq.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(faq)
}

func updateFAQ(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid FAQ ID", http.StatusBadRequest)
		return
	}

	var faq FAQ
	if err := json.NewDecoder(r.Body).Decode(&faq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE faqs SET question=$1, answer=$2, \"order\"=$3 WHERE id=$4",
		faq.Question, faq.Answer, faq.Order, id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "FAQ not found", http.StatusNotFound)
		return
	}

	faq.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(faq)
}

func deleteFAQ(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid FAQ ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM faqs WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "FAQ not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func main() {
	initDB()
	defer db.Close()

	r := mux.NewRouter()

	// Serve static files (uploads)
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))
	// Serve dump files
	r.PathPrefix("/dumps/").Handler(http.StripPrefix("/dumps/", http.FileServer(http.Dir("./dumps/"))))

	// Public API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/products", getProducts).Methods("GET")
	api.HandleFunc("/products/featured", getFeaturedProducts).Methods("GET")
	api.HandleFunc("/products/{id}", getProduct).Methods("GET")
	api.HandleFunc("/categories", getCategories).Methods("GET")
	api.HandleFunc("/collections", getCollections).Methods("GET")
	api.HandleFunc("/collections/{id}", getCollection).Methods("GET")
	api.HandleFunc("/contacts", createContact).Methods("POST")
	api.HandleFunc("/placeholder/check", checkPlaceholder).Methods("GET")
	api.HandleFunc("/faqs", getFAQs).Methods("GET")
	api.HandleFunc("/health", healthCheck).Methods("GET")

	// Admin API routes (CRUD)
	admin := api.PathPrefix("/admin").Subrouter()
	// Upload
	admin.HandleFunc("/upload", uploadImage).Methods("POST")
	// Products
	admin.HandleFunc("/products", createProduct).Methods("POST")
	admin.HandleFunc("/products/{id}", updateProduct).Methods("PUT")
	admin.HandleFunc("/products/{id}", deleteProduct).Methods("DELETE")
	// Categories
	admin.HandleFunc("/categories", createCategory).Methods("POST")
	admin.HandleFunc("/categories/{id}", updateCategory).Methods("PUT")
	admin.HandleFunc("/categories/{id}", deleteCategory).Methods("DELETE")
	// Collections
	admin.HandleFunc("/collections", createCollection).Methods("POST")
	admin.HandleFunc("/collections/{id}", updateCollection).Methods("PUT")
	admin.HandleFunc("/collections/{id}", deleteCollection).Methods("DELETE")
	admin.HandleFunc("/collections/{id}/products", addProductToCollection).Methods("POST")
	admin.HandleFunc("/collections/{id}/products/{product_id}", removeProductFromCollection).Methods("DELETE")
	// Placeholders
	admin.HandleFunc("/placeholders", getPlaceholders).Methods("GET")
	admin.HandleFunc("/placeholders", createPlaceholder).Methods("POST")
	admin.HandleFunc("/placeholders/{id}", getPlaceholder).Methods("GET")
	admin.HandleFunc("/placeholders/{id}", updatePlaceholder).Methods("PUT")
	admin.HandleFunc("/placeholders/{id}", deletePlaceholder).Methods("DELETE")
	// Contacts
	admin.HandleFunc("/contacts", getContacts).Methods("GET")
	admin.HandleFunc("/contacts/{id}", deleteContact).Methods("DELETE")
	// FAQs
	admin.HandleFunc("/faqs", createFAQ).Methods("POST")
	admin.HandleFunc("/faqs/{id}", getFAQ).Methods("GET")
	admin.HandleFunc("/faqs/{id}", updateFAQ).Methods("PUT")
	admin.HandleFunc("/faqs/{id}", deleteFAQ).Methods("DELETE")
	// Database dumps
	admin.HandleFunc("/db/dump", createDump).Methods("POST")
	admin.HandleFunc("/db/restore", restoreDump).Methods("POST")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://frontend:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
