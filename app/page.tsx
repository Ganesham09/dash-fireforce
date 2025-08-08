"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, AlertTriangle, Users, Thermometer, Droplets, Wind, Bot, MapPin, LogOut, Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react'

// Types
type ZoneStatus = "Safe" | "Warning" | "Critical" | "Evacuate"
type RobotStatus = "Idle" | "Scanning" | "Alert"
type HeatIntensity = "Low" | "Medium" | "High"
type FireType = "Paper" | "Electrical" | "Chemical" | null

interface ZoneData {
  id: string
  status: ZoneStatus
  temperature: number
  humidity: number
  smokeLevel: number
  peopleCount: number
  heatIntensity: HeatIntensity
  fireType: FireType
  robotId: string | null
  robotStatus: RobotStatus | null
  alertGenerated?: boolean
  evacuationStarted?: boolean
  lastUpdated?: string
}

interface ApiResponse {
  zones: ZoneData[]
  timestamp: string
  status: string
}

export default function FireForceDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentFireZone, setCurrentFireZone] = useState("Z3")
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [isMqttConnected, setIsMqttConnected] = useState(false)
  const [lastApiUpdate, setLastApiUpdate] = useState<string>("")
  const [isUsingMockData, setIsUsingMockData] = useState(true)
  const router = useRouter()

  // API endpoint - replace with your actual endpoint
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "https://your-api-gateway-url.amazonaws.com/prod/zones"

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("fireforce_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("fireforce_auth")
    router.push("/login")
  }

  // Initialize zone data
  const [zones, setZones] = useState<ZoneData[]>([
    {
      id: "Z1",
      status: "Safe",
      temperature: 23.2,
      humidity: 45,
      smokeLevel: 0.1,
      peopleCount: 0,
      heatIntensity: "Low",
      fireType: null,
      robotId: null,
      robotStatus: null,
    },
    {
      id: "Z2",
      status: "Safe",
      temperature: 23.8,
      humidity: 48,
      smokeLevel: 0.15,
      peopleCount: 0,
      heatIntensity: "Low",
      fireType: null,
      robotId: null,
      robotStatus: null,
    },
    {
      id: "Z3",
      status: "Critical",
      temperature: 78.5,
      humidity: 25,
      smokeLevel: 8.9,
      peopleCount: 0,
      heatIntensity: "High",
      fireType: "Electrical",
      robotId: "R003",
      robotStatus: "Alert",
      alertGenerated: true,
    },
    {
      id: "Z4",
      status: "Safe",
      temperature: 22.8,
      humidity: 52,
      smokeLevel: 0.05,
      peopleCount: 0,
      heatIntensity: "Low",
      fireType: null,
      robotId: null,
      robotStatus: null,
    },
    {
      id: "Z5",
      status: "Safe",
      temperature: 23.5,
      humidity: 48,
      smokeLevel: 0.2,
      peopleCount: 0,
      heatIntensity: "Low",
      fireType: null,
      robotId: null,
      robotStatus: null,
    },
    {
      id: "Z6",
      status: "Safe",
      temperature: 23.4,
      humidity: 50,
      smokeLevel: 0.12,
      peopleCount: 0,
      heatIntensity: "Low",
      fireType: null,
      robotId: null,
      robotStatus: null,
    },
  ])

  // Function to fetch data from API
  const fetchZoneData = async () => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()
        setZones(data.zones)
        setLastApiUpdate(data.timestamp)
        setIsApiConnected(true)
        setIsMqttConnected(data.status === 'connected')
        setIsUsingMockData(false)
        console.log('✅ API Data fetched successfully:', data)
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.log('⚠️ API unavailable, using mock data:', error)
      setIsApiConnected(false)
      setIsUsingMockData(true)
      // Continue with mock data simulation
      simulateMockData()
    }
  }

  // Mock data simulation (fallback when API is not available)
  const simulateMockData = () => {
    const zoneIds = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"]
    const newFireZone = zoneIds[Math.floor(Math.random() * zoneIds.length)]
    setCurrentFireZone(newFireZone)
    updateZonesForFire(newFireZone)
  }

  // Function to update zones based on fire location (for mock data)
  const updateZonesForFire = (fireZoneId: string) => {
    setZones(prevZones =>
      prevZones.map(zone => {
        if (zone.id === fireZoneId) {
          // Fire zone - people count can be 0-3
          const peopleCount = Math.floor(Math.random() * 4) // 0-3 people
          return {
            ...zone,
            status: "Critical" as ZoneStatus,
            temperature: 75 + Math.random() * 10, // 75-85°C
            humidity: 20 + Math.random() * 10,
            smokeLevel: 8 + Math.random() * 2,
            peopleCount: peopleCount,
            heatIntensity: "High" as HeatIntensity,
            fireType: ["Electrical", "Paper", "Chemical"][Math.floor(Math.random() * 3)] as FireType,
            robotId: `R00${zone.id.slice(1)}`,
            robotStatus: "Alert" as RobotStatus,
            alertGenerated: true,
            evacuationStarted: peopleCount > 0,
            lastUpdated: new Date().toISOString(),
          }
        } else {
          // All other zones are safe
          return {
            ...zone,
            status: "Safe" as ZoneStatus,
            temperature: 22 + Math.random() * 3, // 22-25°C
            humidity: 45 + Math.random() * 10,
            smokeLevel: 0.05 + Math.random() * 0.2,
            peopleCount: 0,
            heatIntensity: "Low" as HeatIntensity,
            fireType: null,
            robotId: null,
            robotStatus: null,
            alertGenerated: false,
            evacuationStarted: false,
            lastUpdated: new Date().toISOString(),
          }
        }
      })
    )
  }

  // Main data fetching effect - tries API first, falls back to mock data
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchZoneData()

    // Set up interval for regular updates (8 seconds)
    const interval = setInterval(() => {
      fetchZoneData()
    }, 8000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Real-time data updates for mock data only
  useEffect(() => {
    if (!isAuthenticated || !isUsingMockData) return

    const interval = setInterval(() => {
      setZones(prevZones =>
        prevZones.map(zone => ({
          ...zone,
          temperature: zone.temperature + (Math.random() - 0.5) * 1,
          humidity: Math.max(10, Math.min(80, zone.humidity + (Math.random() - 0.5) * 2)),
          smokeLevel: Math.max(0, zone.smokeLevel + (Math.random() - 0.5) * 0.3),
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [isAuthenticated, isUsingMockData])

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const getStatusColor = (status: ZoneStatus) => {
    switch (status) {
      case "Safe":
        return "bg-green-100 hover:bg-green-200 border-green-300 text-green-800"
      case "Warning":
        return "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800"
      case "Critical":
        return "bg-red-100 hover:bg-red-200 border-red-300 text-red-800"
      case "Evacuate":
        return "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800"
      default:
        return "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800"
    }
  }

  const getStatusBadgeVariant = (status: ZoneStatus) => {
    switch (status) {
      case "Safe":
        return "default"
      case "Warning":
        return "secondary"
      case "Critical":
        return "destructive"
      case "Evacuate":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get the current fire zone for detailed information
  const fireZone = zones.find(zone => zone.status === "Critical")

  // Generate alert message based on people count and evacuation status
  const getAlertMessage = (zone: ZoneData) => {
    if (zone.peopleCount === 0) {
      return "Alert sent to Fire Safety Dept."
    } else if (zone.evacuationStarted) {
      return `Evacuation started - ${zone.peopleCount} ${zone.peopleCount === 1 ? 'person' : 'people'} detected`
    } else {
      return `${zone.peopleCount} ${zone.peopleCount === 1 ? 'person' : 'people'} detected - Alert sent`
    }
  }

  // Generate detailed alert message
  const getDetailedAlertMessage = (zone: ZoneData) => {
    if (zone.peopleCount === 0) {
      return `Emergency protocols activated. Fire safety department has been notified. Robot ${zone.robotId} is actively monitoring the situation. No personnel detected in the zone.`
    } else if (zone.evacuationStarted) {
      return `EVACUATION IN PROGRESS: Emergency protocols activated. Fire safety department and rescue teams have been notified. Robot ${zone.robotId} is actively monitoring the situation and has detected ${zone.peopleCount} ${zone.peopleCount === 1 ? 'person' : 'people'} in the zone. Evacuation procedures are underway.`
    } else {
      return `Emergency protocols activated. Fire safety department has been notified. Robot ${zone.robotId} is actively monitoring the situation and has detected ${zone.peopleCount} ${zone.peopleCount === 1 ? 'person' : 'people'} in the zone. Evacuation procedures are being initiated.`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FireForce</h1>
              <p className="text-sm text-gray-600">Lab Fire Safety Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status Indicators */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {isApiConnected ? (
                  <Cloud className="w-4 h-4 text-green-600" />
                ) : (
                  <CloudOff className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-medium ${isApiConnected ? 'text-green-600' : 'text-red-600'}`}>
                  API {isApiConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                {isMqttConnected ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-medium ${isMqttConnected ? 'text-green-600' : 'text-red-600'}`}>
                  MQTT {isMqttConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Generate Alert
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <div className="text-sm text-gray-600">
              <div>Last Update: {new Date().toLocaleTimeString()}</div>
              {lastApiUpdate && (
                <div className="text-xs text-gray-500">
                  API: {new Date(lastApiUpdate).toLocaleTimeString()}
                </div>
              )}
              {isUsingMockData && (
                <div className="text-xs text-orange-600 font-medium">
                  Using Mock Data
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Lab Map */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>IOT-DE Lab - Zone Overview</span>
              {isUsingMockData && (
                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                  Demo Mode
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
              {zones.map((zone) => (
                <div key={zone.id} className="relative group">
                  <Button
                    variant="outline"
                    className={`h-40 w-full flex flex-col items-center justify-center space-y-3 relative overflow-hidden border-2 p-4 ${getStatusColor(zone.status)} hover:opacity-90 transition-all duration-200`}
                  >
                    <div className="text-xl font-bold">{zone.id}</div>
                    <Badge variant="secondary" className="text-sm bg-white/80 border-gray-300">
                      {zone.status}
                    </Badge>
                    <div className="text-sm font-medium">{zone.temperature.toFixed(1)}°C</div>
                    {zone.robotId && (
                      <div className="flex items-center space-x-1 text-xs font-medium">
                        <Bot className="w-4 h-4" />
                        <span>{zone.robotId}</span>
                      </div>
                    )}
                    {zone.alertGenerated && (
                      <div className={`absolute bottom-2 left-2 right-2 text-xs rounded px-2 py-1 text-center border ${
                        zone.evacuationStarted 
                          ? 'bg-orange-100 text-orange-800 border-orange-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {getAlertMessage(zone)}
                      </div>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone Details - Only for Fire Zone */}
        {fireZone && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">🔥 Zone {fireZone.id} - FIRE ALERT - Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Thermometer className="w-8 h-8 text-red-500" />
                  <div>
                    <div className="text-sm text-gray-600">Temperature</div>
                    <div className="text-xl font-bold text-red-600">{fireZone.temperature.toFixed(1)}°C</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Humidity</div>
                    <div className="text-xl font-bold">{Math.round(fireZone.humidity)}%</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Wind className="w-8 h-8 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Smoke Level</div>
                    <div className="text-xl font-bold text-red-600">{fireZone.smokeLevel.toFixed(1)} ppm</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">People Count</div>
                    <div className="text-xl font-bold">{fireZone.peopleCount}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-600">Heat Intensity</div>
                    <div className="text-xl font-bold text-red-600">{fireZone.heatIntensity}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-600">Fire Type</div>
                    <div className="text-xl font-bold text-red-600">{fireZone.fireType || "None"}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Bot className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-600">Robot ID</div>
                    <div className="text-xl font-bold">{fireZone.robotId}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <div className="text-sm text-gray-600">Robot Status</div>
                    <div className="text-xl font-bold text-red-600">{fireZone.robotStatus}</div>
                  </div>
                </div>
              </div>

              <div className={`mt-6 p-4 border rounded-lg ${
                fireZone.evacuationStarted 
                  ? 'bg-orange-100 border-orange-300' 
                  : 'bg-red-100 border-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    fireZone.evacuationStarted ? 'text-orange-600' : 'text-red-600'
                  }`} />
                  <Badge variant={fireZone.evacuationStarted ? "secondary" : "destructive"} className="text-sm">
                    {fireZone.evacuationStarted 
                      ? `EVACUATION IN PROGRESS: Fire detected in Zone ${fireZone.id}` 
                      : `CRITICAL ALERT: Fire detected in Zone ${fireZone.id}`
                    }
                  </Badge>
                </div>
                <p className={`text-sm mt-2 ${
                  fireZone.evacuationStarted ? 'text-orange-800' : 'text-red-800'
                }`}>
                  {getDetailedAlertMessage(fireZone)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="px-6 py-8">
          {/* Emergency Contacts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Fire Department</h4>
                <p className="text-sm text-red-700">📞 Emergency: 911</p>
                <p className="text-sm text-red-700">📞 Direct: (555) 123-4567</p>
                <p className="text-sm text-red-700">📧 fire.dept@city.gov</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Lab Safety Officer</h4>
                <p className="text-sm text-blue-700">📞 Direct: (555) 234-5678</p>
                <p className="text-sm text-blue-700">📞 Mobile: (555) 234-5679</p>
                <p className="text-sm text-blue-700">📧 safety@iotde.lab</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Security Control</h4>
                <p className="text-sm text-green-700">📞 24/7: (555) 345-6789</p>
                <p className="text-sm text-green-700">📞 Backup: (555) 345-6790</p>
                <p className="text-sm text-green-700">📧 security@iotde.lab</p>
              </div>
            </div>
          </div>

          {/* Additional Emergency Services */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Emergency Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-1">Medical Emergency</h4>
                <p className="text-sm text-gray-600">📞 Ambulance: 911</p>
                <p className="text-sm text-gray-600">📞 Campus Health: (555) 567-8901</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-1">Building Management</h4>
                <p className="text-sm text-gray-600">📞 Facilities: (555) 789-0123</p>
                <p className="text-sm text-gray-600">📞 Maintenance: (555) 789-0124</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">FireForce Dashboard</p>
                    <p className="text-xs text-gray-600">IOT-DE Lab Safety System</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
                <p>© 2024 IOT-DE Lab. All rights reserved.</p>
                <p>System Status: <span className={`font-medium ${isApiConnected ? 'text-green-600' : 'text-orange-600'}`}>
                  {isApiConnected ? 'Online' : 'Demo Mode'}
                </span></p>
                <p>Last System Check: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                For technical support contact: <span className="text-blue-600">tech.support@iotde.lab</span> | 
                System Version: v2.1.0 | 
                Emergency Protocol: EP-2024-001
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
