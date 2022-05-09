package main

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gomodule/redigo/redis"
	kafka "github.com/segmentio/kafka-go"
	log "github.com/sirupsen/logrus"
)

const (
	resourceTypeVulnerability = "vulnerability"
	celeryNotificationTask    = "tasks.notification_worker.notification_task"
)

func getRedisDbNumber() int {
	var dbNumInt int
	var errVal error
	dbNumStr := os.Getenv("REDIS_DB_NUMBER")
	if dbNumStr == "" {
		dbNumInt = 0
	} else {
		dbNumInt, errVal = strconv.Atoi(dbNumStr)
		if errVal != nil {
			dbNumInt = 0
		}
	}
	return dbNumInt
}

func newRedisPool() *redis.Pool {
	redisDbNumber := getRedisDbNumber()
	return &redis.Pool{
		MaxIdle:   15,
		MaxActive: 30, // max number of connections
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", redisAddr, redis.DialDatabase(redisDbNumber))
			if err != nil {
				return nil, err
			}
			return c, err
		},
	}
}

func checkKafkaConn() error {
	log.Info("check connection to kafka brokers: " + kafkaBrokers)
	conn, err := kafka.Dial("tcp", strings.Split(kafkaBrokers, ",")[0])
	if err != nil {
		return err
	}
	defer conn.Close()
	brokers, err := conn.Brokers()
	if err != nil {
		return err
	}
	for _, b := range brokers {
		log.Infof("broker found at %s", b.Host)
	}
	return nil
}

func gracefulExit(err error) {
	if err != nil {
		log.Error(err)
	}
	if postgresDb != nil {
		postgresErr := postgresDb.Close()
		if postgresErr != nil {
			log.Error(postgresErr)
		}
	}
	if redisPubSub != nil {
		redisErr := redisPubSub.Close()
		if redisErr != nil {
			log.Error(redisErr)
		}
	}
	if redisPool != nil {
		redisErr := redisPool.Close()
		if redisErr != nil {
			log.Error(redisErr)
		}
	}
	time.Sleep(time.Second * 5)
	os.Exit(1)
}

func syncPoliciesAndNotificationsSettings() {
	var vulnerabilityNotificationCount int
	row := postgresDb.QueryRow("SELECT COUNT(*) FROM vulnerability_notification where duration_in_mins=-1")
	err := row.Scan(&vulnerabilityNotificationCount)
	if err != nil {
		log.Error(err)
	}
	notificationSettings.Lock()
	if vulnerabilityNotificationCount > 0 {
		notificationSettings.vulnerabilityNotificationsSet = true
	} else {
		notificationSettings.vulnerabilityNotificationsSet = false
	}
	notificationSettings.Unlock()
}

func syncPoliciesAndNotifications() {
	syncPoliciesAndNotificationsSettings()
	ticker := time.NewTicker(60 * time.Second)
	for range ticker.C {
		syncPoliciesAndNotificationsSettings()
	}
}