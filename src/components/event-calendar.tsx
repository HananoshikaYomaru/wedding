"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 6, 6)) // July 6, 2025

  const events = [
    {
      date: new Date(2025, 2, 15), // March 15, 2025
      title: "Save the Date",
      description: "Save the date cards sent out to all guests",
    },
    {
      date: new Date(2025, 4, 1), // May 1, 2025
      title: "RSVP Deadline",
      description: "Please confirm your attendance by this date",
    },
    {
      date: new Date(2025, 5, 5), // June 5, 2025
      title: "Rehearsal Dinner",
      description: "For wedding party and immediate family only",
    },
    {
      date: new Date(2025, 6, 5), // July 5, 2025
      title: "Welcome Dinner",
      description: "Casual dinner for out-of-town guests at The Harbor Restaurant",
    },
    {
      date: new Date(2025, 6, 6), // July 6, 2025
      title: "Wedding Day",
      description: "Ceremony at 3:00 PM, Reception to follow at 5:30 PM",
    },
    {
      date: new Date(2025, 6, 7), // July 7, 2025
      title: "Farewell Brunch",
      description: "Casual brunch for all guests at The Garden Café, 10:00 AM - 12:00 PM",
    },
  ]

  // Find the selected event
  const selectedEvent = events.find((event) => date && event.date.toDateString() === date.toDateString())

  // Get all important dates for the calendar
  const importantDates = events.map((event) => event.date)

  return (
    <section className="py-20 px-4 bg-[#f8f5f2]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center text-[#3d3d3d] mb-16">Important Dates</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal mb-4", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  fromYear={2025}
                  toYear={2025}
                  disabled={[
                    { before: new Date(2025, 2, 1) }, // Before March 1, 2025
                    { after: new Date(2025, 7, 1) }, // After August 1, 2025
                  ]}
                  modifiers={{
                    important: importantDates,
                  }}
                  modifiersStyles={{
                    important: {
                      fontWeight: "bold",
                      backgroundColor: "#f8e9e6",
                      color: "#d3b8a3",
                      border: "2px solid #e5a199",
                    },
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

            <div className="w-full text-center">
              <p className="text-sm text-[#6d6d6d] italic mb-4">Select a date to see event details</p>

              {selectedEvent ? (
                <div className="p-4 border border-[#e5a199] rounded-lg bg-[#f8e9e6]">
                  <h3 className="text-xl font-medium text-[#3d3d3d] mb-2">{selectedEvent.title}</h3>
                  <p className="text-[#6d6d6d] mb-2">{format(selectedEvent.date, "MMMM d, yyyy")}</p>
                  <p className="text-[#6d6d6d]">{selectedEvent.description}</p>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-[#d3b8a3] rounded-lg">
                  <p className="text-[#6d6d6d]">Please select a highlighted date to view event details</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium text-[#3d3d3d] mb-4">Timeline of Events</h3>

            {events.map((event, index) => (
              <div
                key={index}
                className={`flex flex-row gap-4 p-4 rounded-lg bg-white shadow-sm cursor-pointer hover:border-[#e5a199] border ${
                  date && event.date.toDateString() === date.toDateString()
                    ? "border-[#e5a199] bg-[#f8e9e6]"
                    : "border-transparent"
                }`}
                onClick={() => setDate(event.date)}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-[#f8e9e6] rounded-full">
                  <CalendarDays className="w-5 h-5 text-[#d3b8a3]" />
                </div>

                <div className="flex-grow">
                  <h4 className="text-md font-medium text-[#3d3d3d]">{event.title}</h4>
                  <p className="text-sm text-[#6d6d6d]">{format(event.date, "MMMM d, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

