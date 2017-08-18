require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
  #multi-panel
  d3BarplotOutput("tSNE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    plotOutput("lowdimpanel", height = "100%")
  ),flex = c(2,1))#,
#   tags$head(tags$script(src="D3Barplot.js"))
)

server <- function(input, output, session) {
  #multidim panel
  output$tSNE_panel <- renderd3Barplot({
      data <- data.frame(x=(1:15),
                         y=(1:15)/2,
                         z=15:1)
      rownames(data) <- c(LETTERS[1:15])

      d3Barplot(data,
                col=c('steelblue','grey','#de2d26'),
                tooltip=c(paste0('letter_',LETTERS[1:15])),
                xlab='Letters',
                ylab='Frequencies',
                title='New Barplot',
                subtitle='with subtitle',
                callback_handler='BarSelection')
  })

  output$filterpanel <- renderd3Barplot({
      data <- 1:15
      names(data) <- c(LETTERS[1:15])
      d3Barplot(data,
                col=c('steelblue'),
                xlab='Letters',
                ylab='Frequencies',
                yrange=c(0,20),
                title='New Barplot',
                subtitle='with subtitle',
                callback_handler='BarSelection1')
  })


  output$lowdimpanel <- renderPlot(plot(AirPassengers))
  output$currentOutput <- renderPrint({ print(input$BarSelection) })

}

shinyApp(ui, server)
